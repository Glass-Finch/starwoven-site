/**
 * AI Provider integrations for channeling
 */

import type { AIModel, ModelResponse } from './types'

const TIMEOUT_MS = 30000

interface ProviderConfig {
  model: AIModel
  oracle: string // Display name (Iris, Luna, etc.)
  archetype: string // The Oracle, The Muse, etc.
  apiKey: string | undefined
  endpoint: string
  modelId: string
}

// Oracle display names, archetypes, and colors - single source of truth
export const ORACLE_INFO: Record<AIModel, { name: string; archetype: string; color: string }> = {
  'gpt-4.1': { name: 'Iris', archetype: 'The Oracle', color: '#10a37f' },
  'claude-sonnet-4.5': { name: 'Luna', archetype: 'The Muse', color: '#d97706' },
  'gemini-3.0-pro': { name: 'Echo', archetype: 'The Mirror', color: '#4285f4' },
  'deepseek-reasoner': { name: 'Shade', archetype: 'The Deep', color: '#6366f1' },
  'grok-4': { name: 'Nova', archetype: 'The Wild', color: '#ef4444' },
}

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
    model: 'gemini-3.0-pro',
    oracle: ORACLE_INFO['gemini-3.0-pro'].name,
    archetype: ORACLE_INFO['gemini-3.0-pro'].archetype,
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
    model: 'grok-4',
    oracle: ORACLE_INFO['grok-4'].name,
    archetype: ORACLE_INFO['grok-4'].archetype,
    apiKey: process.env.XAI_API_KEY,
    endpoint: 'https://api.x.ai/v1/chat/completions',
    modelId: 'grok-4',
  },
]

// Synthesis model config (Claude Opus 4.6)
const SYNTHESIS_CONFIG = {
  apiKey: process.env.ANTHROPIC_API_KEY,
  endpoint: 'https://api.anthropic.com/v1/messages',
  modelId: 'claude-opus-4-6',
}

/**
 * Call OpenAI-compatible API
 */
async function callOpenAICompatible(
  endpoint: string,
  apiKey: string,
  modelId: string,
  prompt: string,
  signal: AbortSignal
): Promise<string> {
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: modelId,
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 1024,
      temperature: 0.8,
    }),
    signal,
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`API error: ${response.status} - ${error}`)
  }

  const data = await response.json()
  return data.choices[0]?.message?.content || ''
}

/**
 * Call Anthropic API
 */
async function callAnthropic(
  endpoint: string,
  apiKey: string,
  modelId: string,
  prompt: string,
  signal: AbortSignal
): Promise<string> {
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: modelId,
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }],
    }),
    signal,
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`API error: ${response.status} - ${error}`)
  }

  const data = await response.json()
  return data.content[0]?.text || ''
}

/**
 * Call Google AI API
 */
async function callGoogleAI(
  endpoint: string,
  apiKey: string,
  prompt: string,
  signal: AbortSignal
): Promise<string> {
  const url = `${endpoint}?key=${apiKey}`

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        maxOutputTokens: 4096, // Increased from 1024 to prevent truncation
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

  return data.candidates?.[0]?.content?.parts?.[0]?.text || ''
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
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS)

  try {
    let content: string

    if (config.model === 'claude-sonnet-4.5') {
      content = await callAnthropic(
        config.endpoint,
        config.apiKey,
        config.modelId,
        prompt,
        controller.signal
      )
    } else if (config.model === 'gemini-3.0-pro') {
      content = await callGoogleAI(config.endpoint, config.apiKey, prompt, controller.signal)
    } else {
      content = await callOpenAICompatible(
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
      content,
      status: 'success',
      latencyMs: Date.now() - startTime,
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
export async function callSynthesisModel(prompt: string): Promise<string> {
  if (!SYNTHESIS_CONFIG.apiKey) {
    throw new Error('Anthropic API key not configured')
  }

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 60000) // 60s for synthesis

  try {
    const content = await callAnthropic(
      SYNTHESIS_CONFIG.endpoint,
      SYNTHESIS_CONFIG.apiKey,
      SYNTHESIS_CONFIG.modelId,
      prompt,
      controller.signal
    )
    return content
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
    return 'The channels remain silent at this time. Please try again.'
  }
  return successful.reduce((a, b) => (a.content.length > b.content.length ? a : b)).content
}
