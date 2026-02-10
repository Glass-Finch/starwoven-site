import { NextResponse } from 'next/server'
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

import type { ChannelRequest, ChannelResponse, SynthesisMetadata } from '@/lib/types'
import { callAllChannelingModels, callSynthesisModel, getLongestResponse } from '@/lib/ai'
import { buildChannelingPrompt, buildSynthesisPrompt } from '@/lib/prompts'
import { analyzeResponses, MIN_VALID_RESPONSES } from '@/lib/qa'
import { saveReadingServerSide } from '@/lib/supabase'
import { messageTypes } from '@/lib/message-types'
import { MAX_INTENTION_LENGTH } from '@/lib/constants'

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
            synthesis: 'The oracles need a moment of stillness. Please wait before asking again.',
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
          synthesis: 'The request could not be understood.',
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
          synthesis: 'Missing required fields.',
        },
        { status: 400 }
      )
    }

    if (!VALID_MESSAGE_TYPES.includes(messageType)) {
      return NextResponse.json(
        {
          status: 'error',
          threads: [],
          synthesis: 'Invalid message type.',
        },
        { status: 400 }
      )
    }

    if (typeof intention !== 'string' || intention.length > MAX_INTENTION_LENGTH) {
      return NextResponse.json(
        {
          status: 'error',
          threads: [],
          synthesis: `Intention must be ${MAX_INTENTION_LENGTH} characters or fewer.`,
        },
        { status: 400 }
      )
    }

    if (!coordinates.raw || typeof coordinates.raw !== 'string') {
      return NextResponse.json(
        {
          status: 'error',
          threads: [],
          synthesis: 'Invalid coordinates.',
        },
        { status: 400 }
      )
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

    // Analyze all responses in a single Sonnet call (validation + editing + coherence)
    const { validated, processed, validationResults, coherenceResult } = await analyzeResponses(
      responses,
      messageType,
      intention
    )

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
        return NextResponse.json({
          status: 'partial',
          threads: processed,
          synthesis: "The oracles couldn't connect. Please try again.",
          validationResults,
          coherenceResult,
          failedModels,
        })
      }

      // 1-2 valid responses: return longest valid response (no synthesis)
      const fallbackSynthesis = getLongestResponse(validResponses)

      // Save partial reading (fire and forget)
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
        },
      }).catch((err) => console.error('Failed to save reading:', err))

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
      synthesis = await callSynthesisModel(synthesisPrompt)
      synthesisMetadata = {
        prompt: synthesisPrompt,
        threadsUsed: validResponses.map((r) => r.model),
        latencyMs: Date.now() - synthesisStart,
      }
    } catch {
      // Fallback to longest valid response if synthesis fails
      synthesis = getLongestResponse(validResponses)
    }

    // Save reading to database (fire and forget — don't block the response)
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
      },
    }).catch((err) => console.error('Failed to save reading:', err))

    return NextResponse.json({
      status: failedModels.length === 0 ? 'complete' : 'partial',
      threads: processed,
      synthesis,
      synthesisMetadata,
      validationResults,
      coherenceResult,
      failedModels: failedModels.length > 0 ? failedModels : undefined,
    })
  } catch (error) {
    console.error('Channel API error:', error)
    return NextResponse.json(
      {
        status: 'error',
        threads: [],
        synthesis: 'An error occurred while channeling. Please try again.',
      },
      { status: 500 }
    )
  }
}
