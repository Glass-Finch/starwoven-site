import { NextResponse } from 'next/server'

import type { ChannelRequest, ChannelResponse, MessageType, SynthesisMetadata } from '@/lib/types'
import { callAllChannelingModels, callSynthesisModel, getLongestResponse } from '@/lib/ai'
import { buildChannelingPrompt, buildSynthesisPrompt } from '@/lib/prompts'
import { analyzeResponses, MIN_VALID_RESPONSES } from '@/lib/qa'

const VALID_MESSAGE_TYPES: MessageType[] = [
  'beloved',
  'ancestor',
  'sage',
  'cosmos',
  'crossroads',
  'calling',
]
const MAX_INTENTION_LENGTH = 250

export async function POST(request: Request): Promise<NextResponse<ChannelResponse>> {
  try {
    let body: ChannelRequest
    try {
      body = (await request.json()) as ChannelRequest
    } catch {
      return NextResponse.json(
        {
          status: 'partial',
          threads: [],
          synthesis: 'The request could not be understood.',
          failedModels: [],
        },
        { status: 400 }
      )
    }

    const { messageType, coordinates, intention, personalization } = body

    // Validate request
    if (!messageType || !coordinates || !intention) {
      return NextResponse.json(
        {
          status: 'partial',
          threads: [],
          synthesis: 'Missing required fields.',
          failedModels: [],
        },
        { status: 400 }
      )
    }

    if (!VALID_MESSAGE_TYPES.includes(messageType)) {
      return NextResponse.json(
        {
          status: 'partial',
          threads: [],
          synthesis: 'Invalid message type.',
          failedModels: [],
        },
        { status: 400 }
      )
    }

    if (typeof intention !== 'string' || intention.length > MAX_INTENTION_LENGTH) {
      return NextResponse.json(
        {
          status: 'partial',
          threads: [],
          synthesis: 'Intention must be 250 characters or fewer.',
          failedModels: [],
        },
        { status: 400 }
      )
    }

    if (!coordinates.raw || typeof coordinates.raw !== 'string') {
      return NextResponse.json(
        {
          status: 'partial',
          threads: [],
          synthesis: 'Invalid coordinates.',
          failedModels: [],
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
        status: 'partial',
        threads: [],
        synthesis: 'An error occurred while channeling. Please try again.',
        failedModels: [],
      },
      { status: 500 }
    )
  }
}
