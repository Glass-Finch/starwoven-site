import { NextResponse } from 'next/server'
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

import type { ChannelRequest, ChannelResponse, SynthesisMetadata } from '@/lib/types'
import { callAllChannelingModels, callSynthesisModel, getLongestResponse } from '@/lib/ai'
import { buildChannelingPrompt, buildSynthesisPrompt } from '@/lib/prompts'
import { analyzeResponses, MIN_VALID_RESPONSES } from '@/lib/qa'
import { saveReadingServerSide, saveCostTracking } from '@/lib/supabase'
import { messageTypes } from '@/lib/message-types'
import { MAX_INTENTION_LENGTH } from '@/lib/constants'
import { ROUTE_ERRORS } from '@/lib/errors'
import { moderateIntention } from '@/lib/moderation'
import { logReadingCost } from '@/lib/cost'

const VALID_MESSAGE_TYPES = messageTypes.map((m) => m.id)

// Rate limiter: 10 requests per hour per IP (sliding window)
// Graceful degradation: if Redis is unavailable, requests are allowed through
const ratelimit =
  process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN
    ? new Ratelimit({
        redis: new Redis({
          url: process.env.KV_REST_API_URL,
          token: process.env.KV_REST_API_TOKEN,
        }),
        limiter: Ratelimit.slidingWindow(10, '1 h'),
        analytics: true,
      })
    : null

export async function POST(request: Request): Promise<NextResponse<ChannelResponse>> {
  try {
    // Rate limiting (before any validation or AI calls)
    if (ratelimit) {
      const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? '127.0.0.1'
      const { success, remaining } = await ratelimit.limit(ip)

      if (!success) {
        return NextResponse.json(
          {
            status: 'error',
            threads: [],
            synthesis: ROUTE_ERRORS.RATE_LIMITED,
          },
          {
            status: 429,
            headers: { 'X-RateLimit-Remaining': String(remaining) },
          }
        )
      }
    }
    let body: ChannelRequest
    try {
      body = (await request.json()) as ChannelRequest
    } catch {
      return NextResponse.json(
        {
          status: 'error',
          threads: [],
          synthesis: ROUTE_ERRORS.BAD_REQUEST,
        },
        { status: 400 }
      )
    }

    const { messageType, coordinates, intention, personalization, sessionId } = body

    // Validate request
    if (!messageType || !coordinates || !intention || !sessionId) {
      return NextResponse.json(
        {
          status: 'error',
          threads: [],
          synthesis: ROUTE_ERRORS.MISSING_FIELDS,
        },
        { status: 400 }
      )
    }

    if (!VALID_MESSAGE_TYPES.includes(messageType)) {
      return NextResponse.json(
        {
          status: 'error',
          threads: [],
          synthesis: ROUTE_ERRORS.INVALID_TYPE,
        },
        { status: 400 }
      )
    }

    if (typeof intention !== 'string' || intention.length > MAX_INTENTION_LENGTH) {
      return NextResponse.json(
        {
          status: 'error',
          threads: [],
          synthesis: ROUTE_ERRORS.INTENTION_TOO_LONG,
        },
        { status: 400 }
      )
    }

    if (!coordinates.raw || typeof coordinates.raw !== 'string') {
      return NextResponse.json(
        {
          status: 'error',
          threads: [],
          synthesis: ROUTE_ERRORS.INVALID_COORDINATES,
        },
        { status: 400 }
      )
    }

    // Moderation check (fail open if unavailable)
    const moderationResult = await moderateIntention(intention, messageType)

    if (!moderationResult.allowed) {
      // Log cost even for moderation rejections — the Haiku call still costs money
      if (moderationResult.tokenUsage) {
        const { breakdown: modBreakdown } = logReadingCost({
          sessionId,
          moderationTokens: moderationResult.tokenUsage,
          channelingTokens: [],
        })
        saveCostTracking(modBreakdown).catch((err) =>
          console.error('Failed to save moderation cost:', err)
        )
      }

      return NextResponse.json({
        status: 'moderated' as const,
        threads: [],
        synthesis: moderationResult.message || ROUTE_ERRORS.MODERATION_FALLBACK,
        moderationResult,
      })
    }

    // Build channeling prompt with personalization
    const channelingPrompt = buildChannelingPrompt(
      messageType,
      coordinates,
      intention,
      personalization
    )

    // Call all channeling models in parallel
    const responses = await callAllChannelingModels(channelingPrompt)

    // Review all responses in a single Sonnet call (validation + editing + coherence)
    const { validated, processed, validationResults, coherenceResult, reviewTokenUsage } =
      await analyzeResponses(responses, messageType, intention)

    // Get valid successful responses for synthesis
    const validResponses = validated.filter((r) => r.status === 'success' && r.content)

    // Track failed models (either API failures or validation failures)
    const failedModels = responses
      .filter((r) => {
        const validation = validationResults.find((v) => v.model === r.model)
        return r.status !== 'success' || !validation?.isValid
      })
      .map((r) => r.model)

    // Check minimum threshold for valid responses
    if (validResponses.length < MIN_VALID_RESPONSES) {
      // Fallback behavior based on valid response count
      if (validResponses.length === 0) {
        // Log cost even when all oracles failed — the API calls still cost money
        const { cost: failedCost, breakdown: failedBreakdown } = logReadingCost({
          sessionId,
          moderationTokens: moderationResult.tokenUsage,
          channelingTokens: responses.map((r) => ({ model: r.model, tokenUsage: r.tokenUsage })),
          reviewTokens: reviewTokenUsage,
        })

        saveReadingServerSide({
          session_id: sessionId,
          message_type: messageType,
          intention,
          coordinates,
          synthesis: ROUTE_ERRORS.NO_RESPONSES,
          threads: processed,
          metadata: {
            personalization: personalization?.data as Record<string, string> | undefined,
            validation: validationResults,
            coherence: coherenceResult,
            cost: failedCost,
          },
        })
          .then((result) => saveCostTracking(failedBreakdown, result?.id))
          .catch((err) => console.error('Failed to save reading/cost:', err))

        return NextResponse.json({
          status: 'partial',
          threads: processed,
          synthesis: ROUTE_ERRORS.NO_RESPONSES,
          validationResults,
          coherenceResult,
          failedModels,
        })
      }

      // 1-2 valid responses: return longest valid response (no synthesis)
      const fallbackSynthesis = getLongestResponse(validResponses)

      // Log cost for partial reading
      const { cost: partialCost, breakdown: partialBreakdown } = logReadingCost({
        sessionId,
        moderationTokens: moderationResult.tokenUsage,
        channelingTokens: responses.map((r) => ({ model: r.model, tokenUsage: r.tokenUsage })),
        reviewTokens: reviewTokenUsage,
      })

      // Save partial reading, then cost tracking with reading ID
      saveReadingServerSide({
        session_id: sessionId,
        message_type: messageType,
        intention,
        coordinates,
        synthesis: fallbackSynthesis,
        threads: processed,
        metadata: {
          personalization: personalization?.data as Record<string, string> | undefined,
          validation: validationResults,
          coherence: coherenceResult,
          cost: partialCost,
        },
      })
        .then((result) => saveCostTracking(partialBreakdown, result?.id))
        .catch((err) => console.error('Failed to save reading/cost:', err))

      return NextResponse.json({
        status: 'partial',
        threads: processed,
        synthesis: fallbackSynthesis,
        validationResults,
        coherenceResult,
        failedModels,
      })
    }

    // Build synthesis prompt with valid responses only
    const synthesisPrompt = buildSynthesisPrompt(
      messageType,
      intention,
      validResponses.map((r) => ({ model: r.model, content: r.content })),
      personalization
    )

    // Call synthesis model and track timing
    const synthesisStart = Date.now()
    let synthesis: string
    let synthesisMetadata: SynthesisMetadata | undefined

    try {
      const synthesisResult = await callSynthesisModel(synthesisPrompt)
      synthesis = synthesisResult.content
      synthesisMetadata = {
        prompt: synthesisPrompt,
        threadsUsed: validResponses.map((r) => r.model),
        latencyMs: Date.now() - synthesisStart,
        tokenUsage: synthesisResult.tokenUsage,
      }
    } catch {
      // Fallback to longest valid response if synthesis fails
      synthesis = getLongestResponse(validResponses)
    }

    // Log cost for this reading
    const { cost: readingCost, breakdown: costBreakdown } = logReadingCost({
      sessionId,
      moderationTokens: moderationResult.tokenUsage,
      channelingTokens: responses.map((r) => ({ model: r.model, tokenUsage: r.tokenUsage })),
      reviewTokens: reviewTokenUsage,
      synthesisTokens: synthesisMetadata?.tokenUsage,
    })

    // Save reading, then cost tracking with reading ID
    saveReadingServerSide({
      session_id: sessionId,
      message_type: messageType,
      intention,
      coordinates,
      synthesis,
      threads: processed,
      metadata: {
        personalization: personalization?.data as Record<string, string> | undefined,
        synthesis: synthesisMetadata,
        validation: validationResults,
        coherence: coherenceResult,
        cost: readingCost,
      },
    })
      .then((result) => saveCostTracking(costBreakdown, result?.id))
      .catch((err) => console.error('Failed to save reading/cost:', err))

    return NextResponse.json({
      status: failedModels.length === 0 ? 'complete' : 'partial',
      threads: processed,
      synthesis,
      synthesisMetadata,
      validationResults,
      coherenceResult,
      failedModels: failedModels.length > 0 ? failedModels : undefined,
      moderationResult: moderationResult.category === 'self_harm' ? moderationResult : undefined,
    })
  } catch (error) {
    console.error('Channel API error:', error)
    return NextResponse.json(
      {
        status: 'error',
        threads: [],
        synthesis: ROUTE_ERRORS.GENERIC,
      },
      { status: 500 }
    )
  }
}
