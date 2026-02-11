/**
 * AI Provider integrations for channeling
 */

import type { AIModel, ModelResponse, TokenUsage } from './types'
import {
  CHANNELING_TIMEOUT_MS,
  SYNTHESIS_TIMEOUT_MS,
  CHANNELING_MAX_TOKENS,
  SYNTHESIS_MAX_TOKENS,
} from './constants'
import { ROUTE_ERRORS } from './errors'
export const ANTHROPIC_API_VERSION = '2023-06-01'

interface ProviderConfig {
  model: AIModel
  oracle: string // Display name (Iris, Luna, etc.)
  archetype: string // The Oracle, The Muse, etc.
  apiKey: string | undefined
  endpoint: string
  modelId: string
}

// Oracle display names, archetypes, colors, and short model names - single source of truth
export const ORACLE_INFO: Record<
  AIModel,
  { name: string; archetype: string; color: string; shortModel: string }
> = {
  'gpt-4.1': { name: 'Iris', archetype: 'The Oracle', color: '#10a37f', shortModel: 'GPT-4.1' },
  'claude-sonnet-4.5': {
    name: 'Luna',
    archetype: 'The Muse',
    color: '#d97706',
    shortModel: 'Claude Sonnet',
  },
  'gemini-3-pro-preview': {
    name: 'Echo',
    archetype: 'The Mirror',
    color: '#4285f4',
    shortModel: 'Gemini Pro',
  },
  'deepseek-reasoner': {
    name: 'Shade',
    archetype: 'The Deep',
    color: '#6366f1',
    shortModel: 'DeepSeek',
  },
  'grok-4-1-fast-reasoning': {
    name: 'Nova',
    archetype: 'The Wild',
    color: '#ef4444',
    shortModel: 'Grok',
  },
}

// Ordered list of AI models (derived from ORACLE_INFO)
export const AI_MODELS = Object.keys(ORACLE_INFO) as AIModel[]

const PROVIDER_CONFIGS: ProviderConfig[] = [
  {
    model: 'gpt-4.1',
    oracle: ORACLE_INFO['gpt-4.1'].name,
    archetype: ORACLE_INFO['gpt-4.1'].archetype,
    apiKey: process.env.OPENAI_API_KEY,
    endpoint: 'https://api.openai.com/v1/chat/completions',
    modelId: 'gpt-4.1',
  },
  {
    model: 'claude-sonnet-4.5',
    oracle: ORACLE_INFO['claude-sonnet-4.5'].name,
    archetype: ORACLE_INFO['claude-sonnet-4.5'].archetype,
    apiKey: process.env.ANTHROPIC_API_KEY,
    endpoint: 'https://api.anthropic.com/v1/messages',
    modelId: 'claude-sonnet-4-5',
  },
  {
    model: 'gemini-3-pro-preview',
    oracle: ORACLE_INFO['gemini-3-pro-preview'].name,
    archetype: ORACLE_INFO['gemini-3-pro-preview'].archetype,
    apiKey: process.env.GOOGLE_API_KEY,
    endpoint:
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-3-pro-preview:generateContent',
    modelId: 'gemini-3-pro-preview',
  },
  {
    model: 'deepseek-reasoner',
    oracle: ORACLE_INFO['deepseek-reasoner'].name,
    archetype: ORACLE_INFO['deepseek-reasoner'].archetype,
    apiKey: process.env.DEEPSEEK_API_KEY,
    endpoint: 'https://api.deepseek.com/chat/completions',
    modelId: 'deepseek-reasoner',
  },
  {
    model: 'grok-4-1-fast-reasoning',
    oracle: ORACLE_INFO['grok-4-1-fast-reasoning'].name,
    archetype: ORACLE_INFO['grok-4-1-fast-reasoning'].archetype,
    apiKey: process.env.XAI_API_KEY,
    endpoint: 'https://api.x.ai/v1/chat/completions',
    modelId: 'grok-4-1-fast-reasoning',
  },
]

// Synthesis model config (Claude Opus 4.6)
const SYNTHESIS_CONFIG = {
  apiKey: process.env.ANTHROPIC_API_KEY,
  endpoint: 'https://api.anthropic.com/v1/messages',
  modelId: 'claude-opus-4-6',
}

// Return type for provider call functions
interface ProviderResult {
  content: string
  tokenUsage?: TokenUsage
}

/**
 * Extract token usage from Anthropic API response.
 * Shared across channeling, moderation, and review calls.
 */
export function extractAnthropicTokenUsage(data: {
  usage?: { input_tokens?: number; output_tokens?: number }
}): TokenUsage | undefined {
  if (!data.usage) return undefined
  const inputTokens = data.usage.input_tokens ?? 0
  const outputTokens = data.usage.output_tokens ?? 0
  return { inputTokens, outputTokens, totalTokens: inputTokens + outputTokens }
}

/**
 * Call OpenAI-compatible API (OpenAI, DeepSeek, xAI)
 */
async function callOpenAICompatible(
  endpoint: string,
  apiKey: string,
  modelId: string,
  prompt: string,
  signal: AbortSignal,
  maxTokens: number = CHANNELING_MAX_TOKENS
): Promise<ProviderResult> {
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: modelId,
      messages: [{ role: 'user', content: prompt }],
      max_tokens: maxTokens,
      temperature: 0.8,
    }),
    signal,
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`API error: ${response.status} - ${error}`)
  }

  const data = await response.json()
  const tokenUsage: TokenUsage | undefined = data.usage
    ? {
        inputTokens: data.usage.prompt_tokens ?? 0,
        outputTokens: data.usage.completion_tokens ?? 0,
        totalTokens: data.usage.total_tokens ?? 0,
      }
    : undefined

  return {
    content: data.choices[0]?.message?.content || '',
    tokenUsage,
  }
}

/**
 * Call Anthropic API
 */
async function callAnthropic(
  endpoint: string,
  apiKey: string,
  modelId: string,
  prompt: string,
  signal: AbortSignal,
  maxTokens: number = CHANNELING_MAX_TOKENS
): Promise<ProviderResult> {
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': ANTHROPIC_API_VERSION,
    },
    body: JSON.stringify({
      model: modelId,
      max_tokens: maxTokens,
      messages: [{ role: 'user', content: prompt }],
    }),
    signal,
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`API error: ${response.status} - ${error}`)
  }

  const data = await response.json()

  return {
    content: data.content[0]?.text || '',
    tokenUsage: extractAnthropicTokenUsage(data),
  }
}

/**
 * Call Google AI API
 */
async function callGoogleAI(
  endpoint: string,
  apiKey: string,
  prompt: string,
  signal: AbortSignal,
  maxTokens: number = CHANNELING_MAX_TOKENS
): Promise<ProviderResult> {
  const url = `${endpoint}?key=${apiKey}`

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        maxOutputTokens: maxTokens,
        temperature: 0.8,
      },
    }),
    signal,
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`API error: ${response.status} - ${error}`)
  }

  const data = await response.json()

  // Check for truncation
  const finishReason = data.candidates?.[0]?.finishReason
  if (finishReason === 'MAX_TOKENS' || finishReason === 'LENGTH') {
    console.warn('Gemini response truncated due to token limit')
  }

  const tokenUsage: TokenUsage | undefined = data.usageMetadata
    ? {
        inputTokens: data.usageMetadata.promptTokenCount ?? 0,
        outputTokens: data.usageMetadata.candidatesTokenCount ?? 0,
        totalTokens: data.usageMetadata.totalTokenCount ?? 0,
      }
    : undefined

  return {
    content: data.candidates?.[0]?.content?.parts?.[0]?.text || '',
    tokenUsage,
  }
}

/**
 * Call a single channeling model
 */
async function callChannelingModel(config: ProviderConfig, prompt: string): Promise<ModelResponse> {
  const startTime = Date.now()

  if (!config.apiKey) {
    return {
      model: config.model,
      oracle: config.oracle,
      prompt,
      content: '',
      status: 'error',
      error: 'API key not configured',
    }
  }

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), CHANNELING_TIMEOUT_MS)

  try {
    let result: ProviderResult

    if (config.model === 'claude-sonnet-4.5') {
      result = await callAnthropic(
        config.endpoint,
        config.apiKey,
        config.modelId,
        prompt,
        controller.signal
      )
    } else if (config.model === 'gemini-3-pro-preview') {
      result = await callGoogleAI(config.endpoint, config.apiKey, prompt, controller.signal)
    } else {
      result = await callOpenAICompatible(
        config.endpoint,
        config.apiKey,
        config.modelId,
        prompt,
        controller.signal
      )
    }

    return {
      model: config.model,
      oracle: config.oracle,
      prompt,
      content: result.content,
      status: 'success',
      latencyMs: Date.now() - startTime,
      tokenUsage: result.tokenUsage,
    }
  } catch (error) {
    const isTimeout = error instanceof Error && error.name === 'AbortError'
    return {
      model: config.model,
      oracle: config.oracle,
      prompt,
      content: '',
      status: isTimeout ? 'timeout' : 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
      latencyMs: Date.now() - startTime,
    }
  } finally {
    clearTimeout(timeout)
  }
}

/**
 * Call all channeling models in parallel
 */
export async function callAllChannelingModels(prompt: string): Promise<ModelResponse[]> {
  const results = await Promise.all(
    PROVIDER_CONFIGS.map((config) => callChannelingModel(config, prompt))
  )
  return results
}

/**
 * Call synthesis model (Claude Opus)
 */
export async function callSynthesisModel(prompt: string): Promise<ProviderResult> {
  if (!SYNTHESIS_CONFIG.apiKey) {
    throw new Error('Anthropic API key not configured')
  }

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), SYNTHESIS_TIMEOUT_MS)

  try {
    return await callAnthropic(
      SYNTHESIS_CONFIG.endpoint,
      SYNTHESIS_CONFIG.apiKey,
      SYNTHESIS_CONFIG.modelId,
      prompt,
      controller.signal,
      SYNTHESIS_MAX_TOKENS
    )
  } finally {
    clearTimeout(timeout)
  }
}

/**
 * Get the longest successful response as fallback
 */
export function getLongestResponse(responses: ModelResponse[]): string {
  const successful = responses.filter((r) => r.status === 'success' && r.content)
  if (successful.length === 0) {
    return ROUTE_ERRORS.CHANNELS_SILENT
  }
  return successful.reduce((a, b) => (a.content.length > b.content.length ? a : b)).content
}
