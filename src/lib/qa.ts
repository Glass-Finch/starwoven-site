/**
 * AI Response Quality Assurance
 * Validates channeling responses using Claude Haiku before synthesis
 */

import type {
  AIModel,
  MessageType,
  ModelResponse,
  ValidationResult,
  CoherenceResult,
  CoherenceRubric,
} from './types'
import { buildCoherencePrompt } from './prompts'

const VALIDATION_TIMEOUT_MS = 5000 // 5 seconds per validation

// Oracle-specific error messages (understated, in-character)
const ORACLE_ERROR_MESSAGES: Record<AIModel, { refusal: string; timeout: string }> = {
  'gpt-4.1': {
    refusal: 'Iris looked away.',
    timeout: "Iris didn't respond in time.",
  },
  'claude-sonnet-4.5': {
    refusal: 'Luna offered nothing.',
    timeout: 'Luna drifted elsewhere.',
  },
  'gemini-3.0-pro': {
    refusal: 'Echo returned silence.',
    timeout: 'Echo went quiet.',
  },
  'deepseek-reasoner': {
    refusal: 'Shade withdrew.',
    timeout: 'Shade stayed in the deep.',
  },
  'grok-4-1-fast-reasoning': {
    refusal: 'Nova refused.',
    timeout: 'Nova burned past.',
  },
}

/**
 * Get mystical error message for a failed oracle
 */
export function getMysticalErrorMessage(
  model: AIModel,
  errorType: 'refusal' | 'timeout' | 'error'
): string {
  const messages = ORACLE_ERROR_MESSAGES[model]
  if (!messages) {
    return "Couldn't reach this oracle."
  }

  if (errorType === 'error') {
    // Generic for actual errors
    const oracleName = model.includes('gpt')
      ? 'Iris'
      : model.includes('claude')
        ? 'Luna'
        : model.includes('gemini')
          ? 'Echo'
          : model.includes('deepseek')
            ? 'Shade'
            : 'Nova'
    return `Couldn't reach ${oracleName}.`
  }

  return messages[errorType]
}

/**
 * Clean up response content - remove markdown artifacts, disclaimers, normalize whitespace
 */
export function cleanupResponse(content: string): string {
  return (
    content
      .trim()
      // Normalize line breaks (max 2 consecutive)
      .replace(/\n{3,}/g, '\n\n')
      // Remove markdown headers
      .replace(/^#{1,6}\s+/gm, '')
      // Remove bold markdown (preserve text)
      .replace(/\*\*([^*]+)\*\*/g, '$1')
      // Remove italic markdown (preserve text)
      .replace(/\*([^*]+)\*/g, '$1')
      .replace(/_([^_]+)_/g, '$1')
      // Remove entertainment disclaimers (case insensitive)
      .replace(
        /this is (a )?(creative )?(writing )?(exercise|passage) for entertainment purposes only\.?\s*/gi,
        ''
      )
      .replace(/for entertainment purposes only\.?\s*/gi, '')
      // Remove "as an AI" type disclaimers
      .replace(/as an ai[^.]*\./gi, '')
      .replace(/i('m| am) an ai[^.]*\./gi, '')
      // Clean up resulting double spaces
      .replace(/  +/g, ' ')
      // Clean up resulting extra line breaks
      .replace(/\n{3,}/g, '\n\n')
      // Final trim
      .trim()
  )
}

// Validation model config (Claude Haiku for speed)
const VALIDATION_CONFIG = {
  apiKey: process.env.ANTHROPIC_API_KEY,
  endpoint: 'https://api.anthropic.com/v1/messages',
  modelId: 'claude-3-5-haiku-20241022',
}

/**
 * Build the validation prompt for a single response
 */
function buildValidationPrompt(
  response: string,
  messageType: MessageType,
  intention: string
): string {
  return `You are validating an AI response for a consciousness exploration app.

Message type: ${messageType}
User intention: "${intention}"
Response to validate:
---
${response}
---

Mark as INVALID only if:
1. It's a refusal or decline to engage with the prompt
2. It's entirely off-topic or doesn't relate to the intention
3. It's an error message or technical failure text

Mark as VALID if:
- It engages with the prompt (even if unusual, abstract, or includes minor disclaimers)
- It's relevant to the intention in some way

Note: Minor disclaimers or AI mentions are OK - they get cleaned up separately.

Respond with ONLY this JSON (no other text):
{"isValid": boolean, "reason": "brief explanation if invalid", "confidence": 0.0-1.0}`
}

/**
 * Validate a single model response using Claude Haiku
 */
async function validateSingleResponse(
  response: ModelResponse,
  messageType: MessageType,
  intention: string
): Promise<ValidationResult> {
  const startTime = Date.now()

  // Skip validation for failed responses
  if (response.status !== 'success' || !response.content) {
    return {
      model: response.model,
      isValid: false,
      reason: response.status === 'timeout' ? 'Response timed out' : 'Response failed',
      confidence: 1.0,
      latencyMs: 0,
    }
  }

  // Skip validation if API key not configured
  if (!VALIDATION_CONFIG.apiKey) {
    // Assume valid if we can't validate
    return {
      model: response.model,
      isValid: true,
      reason: 'Validation skipped (no API key)',
      confidence: 0.5,
      latencyMs: 0,
    }
  }

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), VALIDATION_TIMEOUT_MS)

  try {
    const prompt = buildValidationPrompt(response.content, messageType, intention)

    const apiResponse = await fetch(VALIDATION_CONFIG.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': VALIDATION_CONFIG.apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: VALIDATION_CONFIG.modelId,
        max_tokens: 256,
        messages: [{ role: 'user', content: prompt }],
      }),
      signal: controller.signal,
    })

    if (!apiResponse.ok) {
      // If validation API fails, assume response is valid
      return {
        model: response.model,
        isValid: true,
        reason: 'Validation API error',
        confidence: 0.5,
        latencyMs: Date.now() - startTime,
      }
    }

    const data = await apiResponse.json()
    const text = data.content?.[0]?.text || ''

    // Parse JSON response
    try {
      // Extract JSON from response (handle potential markdown formatting)
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        throw new Error('No JSON found in response')
      }

      const result = JSON.parse(jsonMatch[0])
      return {
        model: response.model,
        isValid: Boolean(result.isValid),
        reason: result.reason || undefined,
        confidence: typeof result.confidence === 'number' ? result.confidence : 0.5,
        latencyMs: Date.now() - startTime,
      }
    } catch {
      // If parsing fails, assume valid
      return {
        model: response.model,
        isValid: true,
        reason: 'Validation parse error',
        confidence: 0.5,
        latencyMs: Date.now() - startTime,
      }
    }
  } catch (error) {
    const isTimeout = error instanceof Error && error.name === 'AbortError'
    // On error, assume valid to not block good responses
    return {
      model: response.model,
      isValid: true,
      reason: isTimeout ? 'Validation timeout' : 'Validation error',
      confidence: 0.5,
      latencyMs: Date.now() - startTime,
    }
  } finally {
    clearTimeout(timeout)
  }
}

/**
 * Validate all model responses in parallel
 * Returns:
 * - validated: only valid responses (with cleanup) for synthesis
 * - processed: all responses with cleanup/mystical messages for display
 * - validationResults: validation metadata
 */
export async function validateAllResponses(
  responses: ModelResponse[],
  messageType: MessageType,
  intention: string
): Promise<{
  validated: ModelResponse[]
  processed: ModelResponse[]
  validationResults: ValidationResult[]
}> {
  // Run all validations in parallel
  const validationResults = await Promise.all(
    responses.map((response) => validateSingleResponse(response, messageType, intention))
  )

  // Process all responses: cleanup valid ones, add mystical messages to failures
  const processed = responses.map((response, index) => {
    const isValid = validationResults[index].isValid

    if (isValid && response.content) {
      // Apply cleanup to valid responses
      return {
        ...response,
        content: cleanupResponse(response.content),
      }
    } else if (response.status === 'error' || response.status === 'timeout') {
      // Replace error content with mystical message
      const errorType = response.status === 'timeout' ? 'timeout' : 'error'
      return {
        ...response,
        content: getMysticalErrorMessage(response.model, errorType),
      }
    } else if (!isValid) {
      // Refusal or invalid response - use mystical refusal message
      return {
        ...response,
        content: getMysticalErrorMessage(response.model, 'refusal'),
      }
    }

    return response
  })

  // Filter to only valid responses for synthesis
  const validated = processed.filter((_, index) => validationResults[index].isValid)

  // Log validation failures for debugging
  const failures = validationResults.filter((r) => !r.isValid)
  if (failures.length > 0) {
    console.log(
      'Validation failures:',
      failures.map((f) => `${f.model}: ${f.reason}`)
    )
  }

  return { validated, processed, validationResults }
}

/**
 * Get minimum valid response count for synthesis
 */
export const MIN_VALID_RESPONSES = 3

/**
 * Coherence validation timeout (longer since it analyzes all responses)
 */
const COHERENCE_TIMEOUT_MS = 10000 // 10 seconds

/**
 * Default rubric scores (used when validation fails/skipped)
 */
const DEFAULT_RUBRIC: CoherenceRubric = {
  thematicAlignment: 75,
  complementaryPerspectives: 75,
  intuitiveResonance: 75,
  contextualRelevance: 75,
  specificity: 75,
}

/**
 * Calculate weighted coherence score from rubric dimensions
 * Weights: thematic 25%, complementary 20%, resonance 20%, relevance 15%, specificity 20%
 */
function calculateCoherenceScore(rubric: CoherenceRubric): number {
  const weights = {
    thematicAlignment: 0.25,
    complementaryPerspectives: 0.2,
    intuitiveResonance: 0.2,
    contextualRelevance: 0.15,
    specificity: 0.2,
  }

  const score =
    rubric.thematicAlignment * weights.thematicAlignment +
    rubric.complementaryPerspectives * weights.complementaryPerspectives +
    rubric.intuitiveResonance * weights.intuitiveResonance +
    rubric.contextualRelevance * weights.contextualRelevance +
    rubric.specificity * weights.specificity

  return Math.round(score)
}

/**
 * Validate thematic coherence across all oracle responses
 * Uses Claude Haiku to analyze overlap, outliers, and specificity
 */
export async function validateCoherence(
  responses: ModelResponse[],
  messageType: MessageType,
  intention: string
): Promise<CoherenceResult> {
  const startTime = Date.now()

  // Filter to successful responses with content
  const validResponses = responses.filter((r) => r.status === 'success' && r.content)

  // Need at least 3 responses to measure coherence
  if (validResponses.length < 3) {
    return {
      coherenceScore: 0,
      rubric: { ...DEFAULT_RUBRIC, thematicAlignment: 0, complementaryPerspectives: 0 },
      confidence: 0,
      themeOverlap: [],
      outliers: [],
      isCoherent: false,
      reasoning: 'Insufficient responses for coherence analysis',
      genericPhrases: [],
    }
  }

  // Skip if API key not configured
  if (!VALIDATION_CONFIG.apiKey) {
    return {
      coherenceScore: 75,
      rubric: DEFAULT_RUBRIC,
      confidence: 0.5,
      themeOverlap: [],
      outliers: [],
      isCoherent: true,
      reasoning: 'Coherence validation skipped (no API key)',
      genericPhrases: [],
    }
  }

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), COHERENCE_TIMEOUT_MS)

  try {
    const prompt = buildCoherencePrompt(
      validResponses.map((r) => ({ model: r.model, content: r.content! })),
      intention,
      messageType
    )

    const apiResponse = await fetch(VALIDATION_CONFIG.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': VALIDATION_CONFIG.apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: VALIDATION_CONFIG.modelId,
        max_tokens: 1024,
        messages: [{ role: 'user', content: prompt }],
      }),
      signal: controller.signal,
    })

    if (!apiResponse.ok) {
      console.warn('Coherence API error:', apiResponse.status)
      return {
        coherenceScore: 75,
        rubric: DEFAULT_RUBRIC,
        confidence: 0.5,
        themeOverlap: [],
        outliers: [],
        isCoherent: true,
        reasoning: 'Coherence API error, assuming passing',
        genericPhrases: [],
      }
    }

    const data = await apiResponse.json()
    const text = data.content?.[0]?.text || ''

    // Parse JSON response
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        throw new Error('No JSON found in coherence response')
      }

      const result = JSON.parse(jsonMatch[0])

      // Extract rubric scores with defaults
      const rubric: CoherenceRubric = {
        thematicAlignment: result.rubric?.thematicAlignment ?? 75,
        complementaryPerspectives: result.rubric?.complementaryPerspectives ?? 75,
        intuitiveResonance: result.rubric?.intuitiveResonance ?? 75,
        contextualRelevance: result.rubric?.contextualRelevance ?? 75,
        specificity: result.rubric?.specificity ?? 75,
      }

      const coherenceScore = calculateCoherenceScore(rubric)

      console.log(
        `Coherence: ${coherenceScore}% [Theme:${rubric.thematicAlignment} Comp:${rubric.complementaryPerspectives} ` +
          `Res:${rubric.intuitiveResonance} Ctx:${rubric.contextualRelevance} Spec:${rubric.specificity}], ` +
          `Themes: [${(result.themeOverlap || []).join(', ')}], ` +
          `Outliers: ${(result.outliers || []).length}, ` +
          `Latency: ${Date.now() - startTime}ms`
      )

      return {
        coherenceScore,
        rubric,
        confidence: typeof result.confidence === 'number' ? result.confidence : 0.5,
        themeOverlap: result.themeOverlap || [],
        outliers: result.outliers || [],
        isCoherent: coherenceScore >= 75,
        reasoning: result.reasoning || '',
        genericPhrases: result.genericPhrases || [],
      }
    } catch (parseError) {
      console.warn('Coherence parse error:', parseError)
      return {
        coherenceScore: 75,
        rubric: DEFAULT_RUBRIC,
        confidence: 0.5,
        themeOverlap: [],
        outliers: [],
        isCoherent: true,
        reasoning: 'Coherence parse error, assuming passing',
        genericPhrases: [],
      }
    }
  } catch (error) {
    const isTimeout = error instanceof Error && error.name === 'AbortError'
    console.warn('Coherence validation error:', isTimeout ? 'timeout' : error)
    return {
      coherenceScore: 75,
      rubric: DEFAULT_RUBRIC,
      confidence: 0.5,
      themeOverlap: [],
      outliers: [],
      isCoherent: true,
      reasoning: isTimeout ? 'Coherence validation timeout' : 'Coherence validation error',
      genericPhrases: [],
    }
  } finally {
    clearTimeout(timeout)
  }
}
