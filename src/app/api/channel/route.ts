import { NextResponse } from 'next/server'

import type { ChannelRequest, ChannelResponse, SynthesisMetadata } from '@/lib/types'
import { callAllChannelingModels, callSynthesisModel, getLongestResponse } from '@/lib/ai'
import { buildChannelingPrompt, buildSynthesisPrompt } from '@/lib/prompts'
import { validateAllResponses, validateCoherence, MIN_VALID_RESPONSES } from '@/lib/qa'

export async function POST(request: Request): Promise<NextResponse<ChannelResponse>> {
  try {
    const body = (await request.json()) as ChannelRequest
    const { messageType, coordinates, intention, personalization } = body

    // Validate request
    if (!messageType || !coordinates || !intention) {
      return NextResponse.json(
        {
          status: 'partial',
          threads: [],
          synthesis: 'Missing required fields',
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

    // Validate all responses (filters refusals, off-topic, AI meta-commentary)
    // Returns: validated (for synthesis), processed (for display with cleanup/mystical messages)
    const { validated, processed, validationResults } = await validateAllResponses(
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
          threads: processed, // Use processed for display (has mystical messages)
          synthesis: "The oracles couldn't connect. Please try again.",
          validationResults,
          failedModels,
        })
      }

      // 1-2 valid responses: return longest valid response (no synthesis)
      const fallbackSynthesis = getLongestResponse(validResponses)
      return NextResponse.json({
        status: 'partial',
        threads: processed, // Use processed for display
        synthesis: fallbackSynthesis,
        validationResults,
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

    // Validate coherence across all responses
    const coherenceResult = await validateCoherence(validResponses, messageType, intention)

    // Log warning if coherence is below threshold
    if (!coherenceResult.isCoherent) {
      console.warn(`Coherence below 75%: ${coherenceResult.coherenceScore}%`)
    }

    return NextResponse.json({
      status: failedModels.length === 0 ? 'complete' : 'partial',
      threads: processed, // Use processed for display (cleaned up, mystical messages)
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
