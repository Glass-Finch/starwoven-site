import { NextResponse } from 'next/server'
import type { ChannelRequest, ChannelResponse } from '@/lib/types'
import { callAllChannelingModels, callSynthesisModel, getLongestResponse } from '@/lib/ai'
import { buildChannelingPrompt, buildSynthesisPrompt } from '@/lib/prompts'

const MIN_SUCCESSFUL_RESPONSES = 3

export async function POST(request: Request): Promise<NextResponse<ChannelResponse>> {
  try {
    const body = await request.json() as ChannelRequest
    const { messageType, coordinates, intention } = body

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

    // Build channeling prompt
    const channelingPrompt = buildChannelingPrompt(messageType, coordinates, intention)

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

    // Build synthesis prompt
    const synthesisPrompt = buildSynthesisPrompt(
      messageType,
      intention,
      successfulResponses.map(r => ({ model: r.model, content: r.content }))
    )

    // Call synthesis model
    let synthesis: string
    try {
      synthesis = await callSynthesisModel(synthesisPrompt)
    } catch {
      // Fallback to longest response if synthesis fails
      synthesis = getLongestResponse(responses)
    }

    return NextResponse.json({
      status: failedModels.length === 0 ? 'complete' : 'partial',
      threads: responses,
      synthesis,
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
