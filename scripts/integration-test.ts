/**
 * Integration test: calls each AI provider with a real prompt
 *
 * Requires all API keys in .env. Run manually before releases:
 *   npx tsx scripts/integration-test.ts
 *
 * Tests:
 * 1. Each of the 5 channeling oracles returns a non-empty response
 * 2. Sonnet analysis returns valid JSON with expected structure
 * 3. Opus synthesis returns a non-empty woven message
 */
import 'dotenv/config'

import { ANTHROPIC_API_VERSION } from '../src/lib/ai'
import {
  buildChannelingPrompt,
  buildAnalysisPrompt,
  buildSynthesisPrompt,
} from '../src/lib/prompts'
import type { AIModel, CoordinateSet, MessageType } from '../src/lib/types'

// Test configuration
const TEST_INTENTION = 'What do I need to hear right now?'
const TEST_MESSAGE_TYPE: MessageType = 'cosmos'
const TEST_COORDINATES: CoordinateSet = {
  raw: '4821-7293-1547-6038',
  questions: [],
  answers: [],
}
const TIMEOUT_MS = 30000

// Provider definitions
interface ProviderTest {
  model: AIModel
  name: string
  apiKeyEnv: string
  call: (prompt: string) => Promise<string>
}

const providers: ProviderTest[] = [
  {
    model: 'gpt-4.1',
    name: 'Iris (OpenAI)',
    apiKeyEnv: 'OPENAI_API_KEY',
    call: async (prompt: string) => {
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'gpt-4.1',
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 1024,
          temperature: 0.8,
        }),
        signal: AbortSignal.timeout(TIMEOUT_MS),
      })
      if (!res.ok) throw new Error(`${res.status}: ${await res.text()}`)
      const data = await res.json()
      return data.choices[0]?.message?.content || ''
    },
  },
  {
    model: 'claude-sonnet-4.5',
    name: 'Luna (Anthropic)',
    apiKeyEnv: 'ANTHROPIC_API_KEY',
    call: async (prompt: string) => {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.ANTHROPIC_API_KEY!,
          'anthropic-version': ANTHROPIC_API_VERSION,
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-5',
          max_tokens: 1024,
          messages: [{ role: 'user', content: prompt }],
        }),
        signal: AbortSignal.timeout(TIMEOUT_MS),
      })
      if (!res.ok) throw new Error(`${res.status}: ${await res.text()}`)
      const data = await res.json()
      return data.content[0]?.text || ''
    },
  },
  {
    model: 'gemini-3.0-pro',
    name: 'Echo (Google)',
    apiKeyEnv: 'GOOGLE_API_KEY',
    call: async (prompt: string) => {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-pro-preview:generateContent?key=${process.env.GOOGLE_API_KEY}`
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { maxOutputTokens: 4096, temperature: 0.8 },
        }),
        signal: AbortSignal.timeout(TIMEOUT_MS),
      })
      if (!res.ok) throw new Error(`${res.status}: ${await res.text()}`)
      const data = await res.json()
      return data.candidates?.[0]?.content?.parts?.[0]?.text || ''
    },
  },
  {
    model: 'deepseek-reasoner',
    name: 'Shade (DeepSeek)',
    apiKeyEnv: 'DEEPSEEK_API_KEY',
    call: async (prompt: string) => {
      const res = await fetch('https://api.deepseek.com/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'deepseek-reasoner',
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 1024,
          temperature: 0.8,
        }),
        signal: AbortSignal.timeout(TIMEOUT_MS),
      })
      if (!res.ok) throw new Error(`${res.status}: ${await res.text()}`)
      const data = await res.json()
      return data.choices[0]?.message?.content || ''
    },
  },
  {
    model: 'grok-4-1-fast-reasoning',
    name: 'Nova (xAI)',
    apiKeyEnv: 'XAI_API_KEY',
    call: async (prompt: string) => {
      const res = await fetch('https://api.x.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.XAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'grok-4-1-fast-reasoning',
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 1024,
          temperature: 0.8,
        }),
        signal: AbortSignal.timeout(TIMEOUT_MS),
      })
      if (!res.ok) throw new Error(`${res.status}: ${await res.text()}`)
      const data = await res.json()
      return data.choices[0]?.message?.content || ''
    },
  },
]

// Results tracking
interface TestResult {
  name: string
  passed: boolean
  latencyMs: number
  error?: string
  contentLength?: number
}

const results: TestResult[] = []

function log(msg: string) {
  console.log(msg)
}

function pass(name: string, latencyMs: number, contentLength: number) {
  results.push({ name, passed: true, latencyMs, contentLength })
  log(`  PASS  ${name} (${latencyMs}ms, ${contentLength} chars)`)
}

function fail(name: string, error: string, latencyMs: number = 0) {
  results.push({ name, passed: false, latencyMs, error })
  log(`  FAIL  ${name}: ${error}`)
}

async function main() {
  log('\nStarwoven Integration Tests')
  log('='.repeat(50))

  // Check API keys
  const missingKeys = providers.filter((p) => !process.env[p.apiKeyEnv]).map((p) => p.apiKeyEnv)
  if (missingKeys.length > 0) {
    log(`\nMissing API keys: ${missingKeys.join(', ')}`)
    log('Set these in .env before running integration tests.')
    process.exit(1)
  }

  // Build the channeling prompt
  const channelingPrompt = buildChannelingPrompt(
    TEST_MESSAGE_TYPE,
    TEST_COORDINATES,
    TEST_INTENTION
  )

  // Phase 1: Call each oracle
  log('\n--- Phase 1: Channeling (5 oracles in parallel) ---\n')
  const channelingResults: { model: AIModel; content: string }[] = []

  const oracleResults = await Promise.allSettled(
    providers.map(async (provider) => {
      const start = Date.now()
      try {
        const content = await provider.call(channelingPrompt)
        const latency = Date.now() - start
        if (!content || content.trim().length === 0) {
          fail(provider.name, 'Empty response', latency)
          return null
        }
        pass(provider.name, latency, content.length)
        return { model: provider.model, content }
      } catch (err) {
        const latency = Date.now() - start
        fail(provider.name, err instanceof Error ? err.message : String(err), latency)
        return null
      }
    })
  )

  for (const result of oracleResults) {
    if (result.status === 'fulfilled' && result.value) {
      channelingResults.push(result.value)
    }
  }

  // Phase 2: Sonnet analysis
  log('\n--- Phase 2: Analysis (Sonnet) ---\n')
  if (channelingResults.length < 3) {
    fail('Sonnet Analysis', `Only ${channelingResults.length} oracle responses (need 3)`)
  } else {
    const analysisPrompt = buildAnalysisPrompt(channelingResults, TEST_INTENTION, TEST_MESSAGE_TYPE)
    const start = Date.now()

    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.ANTHROPIC_API_KEY!,
          'anthropic-version': ANTHROPIC_API_VERSION,
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-5',
          max_tokens: 4096,
          messages: [{ role: 'user', content: analysisPrompt }],
        }),
        signal: AbortSignal.timeout(15000),
      })

      if (!res.ok) throw new Error(`${res.status}: ${await res.text()}`)

      const data = await res.json()
      const text = data.content?.[0]?.text || ''
      const latency = Date.now() - start

      // Verify JSON structure
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        fail('Sonnet Analysis', 'No JSON in response', latency)
      } else {
        const parsed = JSON.parse(jsonMatch[0])

        // Validate expected fields
        const hasResponses = Array.isArray(parsed.responses)
        const hasRubric =
          parsed.rubric &&
          typeof parsed.rubric.thematicAlignment === 'number' &&
          typeof parsed.rubric.complementaryPerspectives === 'number'
        const hasThemeOverlap = Array.isArray(parsed.themeOverlap)

        if (!hasResponses) {
          fail('Sonnet Analysis', 'Missing responses array', latency)
        } else if (!hasRubric) {
          fail('Sonnet Analysis', 'Missing or invalid rubric', latency)
        } else if (!hasThemeOverlap) {
          fail('Sonnet Analysis', 'Missing themeOverlap array', latency)
        } else {
          pass('Sonnet Analysis', latency, text.length)
          log(
            `    Rubric: Theme=${parsed.rubric.thematicAlignment}, Spec=${parsed.rubric.specificity}`
          )
          log(`    Themes: [${parsed.themeOverlap.join(', ')}]`)
          log(
            `    Valid: ${parsed.responses.filter((r: { isValid: boolean }) => r.isValid).length}/${parsed.responses.length}`
          )
        }
      }
    } catch (err) {
      fail('Sonnet Analysis', err instanceof Error ? err.message : String(err), Date.now() - start)
    }
  }

  // Phase 3: Opus synthesis
  log('\n--- Phase 3: Synthesis (Opus) ---\n')
  if (channelingResults.length < 3) {
    fail('Opus Synthesis', `Only ${channelingResults.length} oracle responses (need 3)`)
  } else {
    const synthesisPrompt = buildSynthesisPrompt(
      TEST_MESSAGE_TYPE,
      TEST_INTENTION,
      channelingResults
    )
    const start = Date.now()

    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.ANTHROPIC_API_KEY!,
          'anthropic-version': ANTHROPIC_API_VERSION,
        },
        body: JSON.stringify({
          model: 'claude-opus-4-6',
          max_tokens: 4096,
          messages: [{ role: 'user', content: synthesisPrompt }],
        }),
        signal: AbortSignal.timeout(60000),
      })

      if (!res.ok) throw new Error(`${res.status}: ${await res.text()}`)

      const data = await res.json()
      const text = data.content?.[0]?.text || ''
      const latency = Date.now() - start

      if (!text || text.trim().length === 0) {
        fail('Opus Synthesis', 'Empty synthesis response', latency)
      } else {
        pass('Opus Synthesis', latency, text.length)
        log(`    Preview: "${text.slice(0, 100)}..."`)
      }
    } catch (err) {
      fail('Opus Synthesis', err instanceof Error ? err.message : String(err), Date.now() - start)
    }
  }

  // Summary
  log('\n' + '='.repeat(50))
  const passed = results.filter((r) => r.passed).length
  const failed = results.filter((r) => !r.passed).length
  log(`\n${passed} passed, ${failed} failed out of ${results.length} tests`)

  if (failed > 0) {
    log('\nFailures:')
    for (const r of results.filter((r) => !r.passed)) {
      log(`  - ${r.name}: ${r.error}`)
    }
    process.exit(1)
  }

  log('\nAll integration tests passed.\n')
}

main().catch((err) => {
  console.error('Unexpected error:', err)
  process.exit(1)
})
