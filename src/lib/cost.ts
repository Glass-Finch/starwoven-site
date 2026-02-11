/**
 * Cost tracking for Starwoven readings
 *
 * Captures token usage from all API calls in a reading and estimates cost.
 * Logs to console and returns data for Supabase persistence.
 */

import type { AIModel, TokenUsage, ReadingCost } from './types'

// Pricing per 1M tokens (USD) — verified 2026-02-10
// Sources: OpenAI, Anthropic, Google, DeepSeek, xAI pricing pages
const PRICING: Record<string, { input: number; output: number }> = {
  // Channeling oracles
  'gpt-4.1': { input: 2.0, output: 8.0 },
  'claude-sonnet-4.5': { input: 3.0, output: 15.0 },
  'gemini-3-pro-preview': { input: 2.0, output: 12.0 },
  'deepseek-reasoner': { input: 0.28, output: 0.42 },
  'grok-4-1-fast-reasoning': { input: 0.2, output: 0.5 },
  // Moderation (Haiku 4.5)
  moderation: { input: 1.0, output: 5.0 },
  // Review (Sonnet 4.5)
  review: { input: 3.0, output: 15.0 },
  // Synthesis (Opus 4.6)
  synthesis: { input: 5.0, output: 25.0 },
}

function estimateCostUSD(usage: TokenUsage, pricingKey: string): number {
  const price = PRICING[pricingKey]
  if (!price) return 0
  return (usage.inputTokens * price.input + usage.outputTokens * price.output) / 1_000_000
}

/** Per-stage cost data for Supabase persistence */
export interface CostBreakdown {
  sessionId: string
  moderation: { inputTokens: number; outputTokens: number; costUSD: number } | null
  channeling: { inputTokens: number; outputTokens: number; costUSD: number }
  review: { inputTokens: number; outputTokens: number; costUSD: number } | null
  synthesis: { inputTokens: number; outputTokens: number; costUSD: number } | null
  perModel: Record<string, { inputTokens: number; outputTokens: number; costUSD: number }>
  totalTokens: number
  estimatedCostUSD: number
}

/**
 * Log cost summary for a complete reading.
 * Returns ReadingCost for metadata and CostBreakdown for Supabase persistence.
 */
export function logReadingCost(params: {
  sessionId: string
  moderationTokens?: TokenUsage
  channelingTokens: { model: AIModel; tokenUsage?: TokenUsage }[]
  reviewTokens?: TokenUsage
  synthesisTokens?: TokenUsage
}): { cost: ReadingCost; breakdown: CostBreakdown } {
  let totalTokens = 0
  let totalCost = 0

  // Moderation
  let moderationBreakdown: CostBreakdown['moderation'] = null
  if (params.moderationTokens) {
    const cost = estimateCostUSD(params.moderationTokens, 'moderation')
    moderationBreakdown = {
      inputTokens: params.moderationTokens.inputTokens,
      outputTokens: params.moderationTokens.outputTokens,
      costUSD: cost,
    }
    totalTokens += params.moderationTokens.totalTokens
    totalCost += cost
  }

  // Channeling (5 oracles)
  let channelingInputTokens = 0
  let channelingOutputTokens = 0
  let channelingCost = 0
  const perModel: CostBreakdown['perModel'] = {}

  for (const { model, tokenUsage } of params.channelingTokens) {
    if (tokenUsage) {
      const cost = estimateCostUSD(tokenUsage, model)
      perModel[model] = {
        inputTokens: tokenUsage.inputTokens,
        outputTokens: tokenUsage.outputTokens,
        costUSD: cost,
      }
      channelingInputTokens += tokenUsage.inputTokens
      channelingOutputTokens += tokenUsage.outputTokens
      channelingCost += cost
      totalTokens += tokenUsage.totalTokens
      totalCost += cost
    }
  }

  // Review
  let reviewBreakdown: CostBreakdown['review'] = null
  if (params.reviewTokens) {
    const cost = estimateCostUSD(params.reviewTokens, 'review')
    reviewBreakdown = {
      inputTokens: params.reviewTokens.inputTokens,
      outputTokens: params.reviewTokens.outputTokens,
      costUSD: cost,
    }
    totalTokens += params.reviewTokens.totalTokens
    totalCost += cost
  }

  // Synthesis
  let synthesisBreakdown: CostBreakdown['synthesis'] = null
  if (params.synthesisTokens) {
    const cost = estimateCostUSD(params.synthesisTokens, 'synthesis')
    synthesisBreakdown = {
      inputTokens: params.synthesisTokens.inputTokens,
      outputTokens: params.synthesisTokens.outputTokens,
      costUSD: cost,
    }
    totalTokens += params.synthesisTokens.totalTokens
    totalCost += cost
  }

  const estimatedCostUSD = Math.round(totalCost * 10000) / 10000

  const breakdown: CostBreakdown = {
    sessionId: params.sessionId,
    moderation: moderationBreakdown,
    channeling: {
      inputTokens: channelingInputTokens,
      outputTokens: channelingOutputTokens,
      costUSD: Math.round(channelingCost * 10000) / 10000,
    },
    review: reviewBreakdown,
    synthesis: synthesisBreakdown,
    perModel,
    totalTokens,
    estimatedCostUSD,
  }

  console.info('[cost]', JSON.stringify(breakdown))

  return {
    cost: { totalTokens, estimatedCostUSD },
    breakdown,
  }
}
