/**
 * AI Response Quality Assurance
 * Validates channeling responses using Claude Haiku before synthesis
 */

import type { MessageType, ModelResponse, ValidationResult } from './types'

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
