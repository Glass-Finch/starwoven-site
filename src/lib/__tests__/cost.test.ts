import { describe, it, expect, vi } from 'vitest'

import { logReadingCost } from '../cost'
import type { AIModel, TokenUsage } from '../types'

const mockTokenUsage = (input: number, output: number): TokenUsage => ({
  inputTokens: input,
  outputTokens: output,
  totalTokens: input + output,
})

describe('logReadingCost', () => {
  it('aggregates all stages into total cost', () => {
    const { cost } = logReadingCost({
      sessionId: 'test-session',
      moderationTokens: mockTokenUsage(3000, 200),
      channelingTokens: [
        { model: 'gpt-4.1' as AIModel, tokenUsage: mockTokenUsage(1500, 800) },
        { model: 'claude-sonnet-4.5' as AIModel, tokenUsage: mockTokenUsage(1500, 800) },
        { model: 'gemini-3-pro-preview' as AIModel, tokenUsage: mockTokenUsage(1500, 800) },
        { model: 'deepseek-reasoner' as AIModel, tokenUsage: mockTokenUsage(1500, 800) },
        { model: 'grok-4-1-fast-reasoning' as AIModel, tokenUsage: mockTokenUsage(1500, 800) },
      ],
      reviewTokens: mockTokenUsage(6000, 4000),
      synthesisTokens: mockTokenUsage(8000, 3000),
    })

    expect(cost.totalTokens).toBe(
      3200 + // moderation
        2300 * 5 + // 5 channeling calls
        10000 + // review
        11000 // synthesis
    )
    expect(cost.estimatedCostUSD).toBeGreaterThan(0)
    expect(cost.estimatedCostUSD).toBeLessThan(1)
  })

  it('handles missing token usage gracefully', () => {
    const { cost } = logReadingCost({
      sessionId: 'test-session',
      channelingTokens: [
        { model: 'gpt-4.1' as AIModel, tokenUsage: undefined },
        { model: 'claude-sonnet-4.5' as AIModel, tokenUsage: undefined },
      ],
    })

    expect(cost.totalTokens).toBe(0)
    expect(cost.estimatedCostUSD).toBe(0)
  })

  it('handles partial token usage (some stages missing)', () => {
    const { cost } = logReadingCost({
      sessionId: 'test-session',
      moderationTokens: mockTokenUsage(3000, 200),
      channelingTokens: [
        { model: 'gpt-4.1' as AIModel, tokenUsage: mockTokenUsage(1500, 800) },
        { model: 'claude-sonnet-4.5' as AIModel, tokenUsage: undefined },
      ],
    })

    expect(cost.totalTokens).toBe(3200 + 2300) // moderation + 1 channeling
    expect(cost.estimatedCostUSD).toBeGreaterThan(0)
  })

  it('rounds cost to 4 decimal places', () => {
    const { cost } = logReadingCost({
      sessionId: 'test-session',
      channelingTokens: [{ model: 'gpt-4.1' as AIModel, tokenUsage: mockTokenUsage(1, 1) }],
    })

    const decimalStr = cost.estimatedCostUSD.toString().split('.')[1] || ''
    expect(decimalStr.length).toBeLessThanOrEqual(4)
  })

  it('returns 0 cost for unknown pricing keys', () => {
    const { cost } = logReadingCost({
      sessionId: 'test-session',
      channelingTokens: [
        { model: 'unknown-model' as AIModel, tokenUsage: mockTokenUsage(1000, 1000) },
      ],
    })

    expect(cost.totalTokens).toBe(2000)
    expect(cost.estimatedCostUSD).toBe(0)
  })

  it('logs to console with [cost] prefix', () => {
    const consoleSpy = vi.spyOn(console, 'info').mockImplementation(() => {})

    logReadingCost({
      sessionId: 'test-session',
      channelingTokens: [{ model: 'gpt-4.1' as AIModel, tokenUsage: mockTokenUsage(100, 50) }],
    })

    expect(consoleSpy).toHaveBeenCalledOnce()
    expect(consoleSpy).toHaveBeenCalledWith('[cost]', expect.any(String))

    const loggedJson = JSON.parse(consoleSpy.mock.calls[0][1] as string)
    expect(loggedJson.sessionId).toBe('test-session')
    expect(loggedJson).toHaveProperty('channeling')
    expect(loggedJson).toHaveProperty('totalTokens')
    expect(loggedJson).toHaveProperty('estimatedCostUSD')

    consoleSpy.mockRestore()
  })

  it('calculates correct cost for known model (GPT-4.1: $2/M input, $8/M output)', () => {
    const consoleSpy = vi.spyOn(console, 'info').mockImplementation(() => {})

    logReadingCost({
      sessionId: 'test-session',
      channelingTokens: [
        { model: 'gpt-4.1' as AIModel, tokenUsage: mockTokenUsage(1_000_000, 1_000_000) },
      ],
    })

    const loggedJson = JSON.parse(consoleSpy.mock.calls[0][1] as string)
    const gptCost = loggedJson.perModel['gpt-4.1'].costUSD

    // 1M input tokens * $2/M + 1M output tokens * $8/M = $10
    expect(gptCost).toBe(10)

    consoleSpy.mockRestore()
  })

  it('returns per-stage breakdown for Supabase persistence', () => {
    const { breakdown } = logReadingCost({
      sessionId: 'test-session',
      moderationTokens: mockTokenUsage(3000, 200),
      channelingTokens: [{ model: 'gpt-4.1' as AIModel, tokenUsage: mockTokenUsage(1500, 800) }],
      reviewTokens: mockTokenUsage(6000, 4000),
      synthesisTokens: mockTokenUsage(8000, 3000),
    })

    expect(breakdown.sessionId).toBe('test-session')
    expect(breakdown.moderation).not.toBeNull()
    expect(breakdown.moderation!.inputTokens).toBe(3000)
    expect(breakdown.channeling.inputTokens).toBe(1500)
    expect(breakdown.review).not.toBeNull()
    expect(breakdown.synthesis).not.toBeNull()
    expect(breakdown.perModel['gpt-4.1']).toBeDefined()
    expect(breakdown.perModel['gpt-4.1'].inputTokens).toBe(1500)
  })
})
