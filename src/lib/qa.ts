/**
 * AI Response Quality Assurance
 * Validates channeling responses using Claude Haiku before synthesis
 */

import type {
  MessageType,
  ModelResponse,
  ValidationResult,
  CoherenceResult,
  CoherenceRubric,
} from './types'
import { buildCoherencePrompt } from './prompts'

const VALIDATION_TIMEOUT_MS = 5000 // 5 seconds per validation

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

Evaluate this response:
1. Is it on-topic and relevant to the intention?
2. Is it in an appropriate reflective/channeling tone?
3. Is it NOT a refusal, disclaimer, or error message?
4. Is it free of meta-commentary about being an AI?

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
 * Returns validated responses and validation results
 */
export async function validateAllResponses(
  responses: ModelResponse[],
  messageType: MessageType,
  intention: string
): Promise<{
  validated: ModelResponse[]
  validationResults: ValidationResult[]
}> {
  // Run all validations in parallel
  const validationResults = await Promise.all(
    responses.map((response) => validateSingleResponse(response, messageType, intention))
  )

  // Filter to only valid responses
  const validated = responses.filter((_, index) => validationResults[index].isValid)

  // Log validation failures for debugging
  const failures = validationResults.filter((r) => !r.isValid)
  if (failures.length > 0) {
    console.log(
      'Validation failures:',
      failures.map((f) => `${f.model}: ${f.reason}`)
    )
  }

  return { validated, validationResults }
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
