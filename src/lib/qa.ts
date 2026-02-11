/**
 * AI Response Quality Assurance
 *
 * Single-pass analysis using Claude Sonnet: validates responses,
 * edits/cleans content, and measures coherence in one API call.
 */

import type {
  AIModel,
  MessageType,
  ModelResponse,
  TokenUsage,
  ValidationResult,
  CoherenceResult,
  CoherenceRubric,
} from './types'
import { buildAnalysisPrompt } from './prompts'
import { ORACLE_INFO, ANTHROPIC_API_VERSION, extractAnthropicTokenUsage } from './ai'
import { ANALYSIS_TIMEOUT_MS, ANALYSIS_MAX_TOKENS, REVIEW_TEMPERATURE } from './constants'

/**
 * Get minimum valid response count for synthesis
 */
export const MIN_VALID_RESPONSES = 3

// Analysis model config (Claude Sonnet for validation + coherence + editing)
const ANALYSIS_CONFIG = {
  apiKey: process.env.ANTHROPIC_API_KEY,
  endpoint: 'https://api.anthropic.com/v1/messages',
  modelId: 'claude-sonnet-4-5',
}

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
  'gemini-3-pro-preview': {
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
 * Get in-character error message for a failed oracle
 */
export function getOracleErrorMessage(
  model: AIModel,
  errorType: 'refusal' | 'timeout' | 'error'
): string {
  const messages = ORACLE_ERROR_MESSAGES[model]
  if (!messages) {
    return "Couldn't reach this oracle."
  }

  if (errorType === 'error') {
    const oracleName = ORACLE_INFO[model]?.name || 'this oracle'
    return `Couldn't reach ${oracleName}.`
  }

  return messages[errorType]
}

/**
 * Clean up response content - regex fallback when Sonnet analysis is unavailable.
 * Removes markdown artifacts, disclaimers, normalizes whitespace.
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

/**
 * Default rubric scores (used when analysis fails/skipped)
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
export function calculateCoherenceScore(rubric: CoherenceRubric): number {
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
 * Build fallback results when Sonnet analysis is unavailable.
 * Uses regex cleanup for content, assumes all successful responses are valid,
 * and returns default coherence scores.
 */
function buildFallbackResults(
  responses: ModelResponse[],
  fallbackReason: string
): {
  validated: ModelResponse[]
  processed: ModelResponse[]
  validationResults: ValidationResult[]
  coherenceResult: CoherenceResult
} {
  const validationResults: ValidationResult[] = responses.map((r) => ({
    model: r.model,
    isValid: r.status === 'success' && Boolean(r.content),
    reason: r.status !== 'success' ? `Response ${r.status}` : fallbackReason,
    confidence: r.status === 'success' ? 0.5 : 1.0,
    latencyMs: 0,
  }))

  const processed = responses.map((response, index) => {
    if (validationResults[index].isValid && response.content) {
      return { ...response, content: cleanupResponse(response.content) }
    } else if (response.status === 'timeout') {
      return { ...response, content: getOracleErrorMessage(response.model, 'timeout') }
    } else if (response.status === 'error') {
      return { ...response, content: getOracleErrorMessage(response.model, 'error') }
    }
    return response
  })

  const validated = processed.filter((_, i) => validationResults[i].isValid)

  return {
    validated,
    processed,
    validationResults,
    coherenceResult: {
      coherenceScore: 75,
      rubric: DEFAULT_RUBRIC,
      confidence: 0.5,
      themeOverlap: [],
      outliers: [],
      isCoherent: true,
      reasoning: fallbackReason,
      genericPhrases: [],
    },
  }
}

/**
 * Analyze all oracle responses in a single Sonnet API call.
 *
 * Combines three concerns that were previously separate:
 * 1. Validation: Is each response a genuine engagement or a refusal/error?
 * 2. Editing: Clean up valid responses (remove markdown, disclaimers, AI refs)
 * 3. Coherence: Measure thematic alignment, complementary perspectives, specificity
 *
 * Returns:
 * - validated: only valid responses (with edited content) for synthesis
 * - processed: all responses with edited content or oracle error messages for display
 * - validationResults: per-response validation metadata
 * - coherenceResult: cross-response coherence analysis
 */
export async function analyzeResponses(
  responses: ModelResponse[],
  messageType: MessageType,
  intention: string
): Promise<{
  validated: ModelResponse[]
  processed: ModelResponse[]
  validationResults: ValidationResult[]
  coherenceResult: CoherenceResult
  reviewTokenUsage?: TokenUsage
}> {
  // Separate successful responses (need analysis) from failed ones (don't)
  const successful = responses.filter((r) => r.status === 'success' && r.content)
  const failed = responses.filter((r) => r.status !== 'success' || !r.content)

  // Pre-build validation results for failed responses
  const failedValidations: ValidationResult[] = failed.map((r) => ({
    model: r.model,
    isValid: false,
    reason: r.status === 'timeout' ? 'Response timed out' : 'Response failed',
    confidence: 1.0,
    latencyMs: 0,
  }))

  // If fewer than 3 successful responses, skip Sonnet call entirely
  if (successful.length < MIN_VALID_RESPONSES) {
    return buildFallbackResults(responses, 'Insufficient responses for analysis')
  }

  // Skip if API key not configured
  if (!ANALYSIS_CONFIG.apiKey) {
    return buildFallbackResults(responses, 'Analysis skipped (no API key)')
  }

  const startTime = Date.now()
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), ANALYSIS_TIMEOUT_MS)

  try {
    const prompt = buildAnalysisPrompt(
      successful.map((r) => ({ model: r.model, content: r.content })),
      intention,
      messageType
    )

    const apiResponse = await fetch(ANALYSIS_CONFIG.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANALYSIS_CONFIG.apiKey,
        'anthropic-version': ANTHROPIC_API_VERSION,
      },
      body: JSON.stringify({
        model: ANALYSIS_CONFIG.modelId,
        max_tokens: ANALYSIS_MAX_TOKENS,
        temperature: REVIEW_TEMPERATURE,
        messages: [{ role: 'user', content: prompt }],
      }),
      signal: controller.signal,
    })

    if (!apiResponse.ok) {
      console.warn('Analysis API error:', apiResponse.status)
      return buildFallbackResults(responses, 'Analysis API error, using regex cleanup')
    }

    const data = await apiResponse.json()
    const text = data.content?.[0]?.text || ''
    const latencyMs = Date.now() - startTime

    // Extract token usage from Anthropic response
    const reviewTokenUsage = extractAnthropicTokenUsage(data)

    // Parse JSON response
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      console.warn('No JSON found in analysis response')
      return buildFallbackResults(responses, 'Analysis parse error, using regex cleanup')
    }

    const result = JSON.parse(jsonMatch[0])

    // Build validation results for successful responses from Sonnet's analysis
    const analysisResponses: Array<{
      index: number
      isValid: boolean
      reason: string
      confidence: number
      editedContent: string
    }> = result.responses || []

    const successfulValidations: ValidationResult[] = successful.map((r, i) => {
      const analysis = analysisResponses.find((a) => a.index === i)
      return {
        model: r.model,
        isValid: analysis ? Boolean(analysis.isValid) : true,
        reason: analysis?.reason || undefined,
        confidence: analysis?.confidence ?? 0.5,
        latencyMs,
      }
    })

    // Combine all validation results (maintain original response order)
    const validationResults: ValidationResult[] = responses.map((r) => {
      const failedResult = failedValidations.find((fv) => fv.model === r.model)
      if (failedResult) return failedResult
      const successResult = successfulValidations.find((sv) => sv.model === r.model)
      if (successResult) return successResult
      return {
        model: r.model,
        isValid: false,
        reason: 'Not found in analysis',
        confidence: 0,
        latencyMs,
      }
    })

    // Build processed responses (edited content for valid, oracle error messages for invalid)
    const processed = responses.map((response) => {
      const validation = validationResults.find((v) => v.model === response.model)

      if (validation?.isValid && response.status === 'success' && response.content) {
        // Find the edited content from Sonnet
        const successIndex = successful.findIndex((s) => s.model === response.model)
        const analysis = analysisResponses.find((a) => a.index === successIndex)
        const editedContent = analysis?.editedContent

        return {
          ...response,
          content: editedContent || cleanupResponse(response.content),
        }
      } else if (response.status === 'timeout') {
        return { ...response, content: getOracleErrorMessage(response.model, 'timeout') }
      } else if (response.status === 'error') {
        return { ...response, content: getOracleErrorMessage(response.model, 'error') }
      } else if (!validation?.isValid) {
        return { ...response, content: getOracleErrorMessage(response.model, 'refusal') }
      }

      return response
    })

    // Filter to valid responses for synthesis
    const validated = processed.filter((r) => {
      const validation = validationResults.find((v) => v.model === r.model)
      return validation?.isValid
    })

    // Extract coherence rubric
    const rubric: CoherenceRubric = {
      thematicAlignment: result.rubric?.thematicAlignment ?? 75,
      complementaryPerspectives: result.rubric?.complementaryPerspectives ?? 75,
      intuitiveResonance: result.rubric?.intuitiveResonance ?? 75,
      contextualRelevance: result.rubric?.contextualRelevance ?? 75,
      specificity: result.rubric?.specificity ?? 75,
    }

    const coherenceScore = calculateCoherenceScore(rubric)

    console.warn(
      `Analysis: ${coherenceScore}% [Theme:${rubric.thematicAlignment} Comp:${rubric.complementaryPerspectives} ` +
        `Res:${rubric.intuitiveResonance} Ctx:${rubric.contextualRelevance} Spec:${rubric.specificity}], ` +
        `Themes: [${(result.themeOverlap || []).join(', ')}], ` +
        `Outliers: ${(result.outliers || []).length}, ` +
        `Valid: ${validated.length}/${responses.length}, ` +
        `Latency: ${latencyMs}ms`
    )

    const coherenceResult: CoherenceResult = {
      coherenceScore,
      rubric,
      confidence: typeof result.coherenceConfidence === 'number' ? result.coherenceConfidence : 0.5,
      themeOverlap: result.themeOverlap || [],
      outliers: result.outliers || [],
      isCoherent: coherenceScore >= 75,
      reasoning: result.reasoning || '',
      genericPhrases: result.genericPhrases || [],
    }

    // Log validation failures
    const failures = validationResults.filter((r) => !r.isValid)
    if (failures.length > 0) {
      console.warn(
        'Validation failures:',
        failures.map((f) => `${f.model}: ${f.reason}`)
      )
    }

    // Log coherence warning
    if (!coherenceResult.isCoherent) {
      console.warn(`Coherence below 75%: ${coherenceScore}%`)
    }

    return { validated, processed, validationResults, coherenceResult, reviewTokenUsage }
  } catch (error) {
    const isTimeout = error instanceof Error && error.name === 'AbortError'
    console.warn('Analysis error:', isTimeout ? 'timeout' : error)
    return buildFallbackResults(
      responses,
      isTimeout ? 'Analysis timeout, using regex cleanup' : 'Analysis error, using regex cleanup'
    )
  } finally {
    clearTimeout(timeout)
  }
}
