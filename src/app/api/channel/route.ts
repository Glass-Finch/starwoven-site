import { NextResponse } from 'next/server'
import type { ChannelRequest, ChannelResponse, SynthesisMetadata } from '@/lib/types'
import { callAllChannelingModels, callSynthesisModel, getLongestResponse } from '@/lib/ai'
import { buildChannelingPrompt, buildSynthesisPrompt } from '@/lib/prompts'

const MIN_SUCCESSFUL_RESPONSES = 3

export async function POST(request: Request): Promise<NextResponse<ChannelResponse>> {
  try {
    const body = await request.json() as ChannelRequest
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
    const channelingPrompt = buildChannelingPrompt(messageType, coordinates, intention, personalization)

    // Call all channeling models in parallel
    const responses = await callAllChannelingModels(channelingPrompt)

    // Filter successful responses
    const successfulResponses = responses.filter(r => r.status === 'success' && r.content)
    const failedModels = responses
      .filter(r => r.status !== 'success')
      .map(r => r.model)

    // Check minimum threshold
    if (successfulResponses.length < MIN_SUCCESSFUL_RESPONSES) {
      // Use longest response as fallback
      const fallbackSynthesis = getLongestResponse(responses)
      return NextResponse.json({
        status: 'partial',
        threads: responses,
        synthesis: fallbackSynthesis,
        failedModels,
      })
    }

    // Build synthesis prompt with personalization
    const synthesisPrompt = buildSynthesisPrompt(
      messageType,
      intention,
      successfulResponses.map(r => ({ model: r.model, content: r.content })),
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
        threadsUsed: successfulResponses.map(r => r.model),
        latencyMs: Date.now() - synthesisStart,
      }
    } catch {
      // Fallback to longest response if synthesis fails
      synthesis = getLongestResponse(responses)
    }

    return NextResponse.json({
      status: failedModels.length === 0 ? 'complete' : 'partial',
      threads: responses,
      synthesis,
      synthesisMetadata,
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
