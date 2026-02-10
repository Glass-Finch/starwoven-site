/**
 * Test refined prompt with ALL oracles + coherence check
 * Tests with PERSONALIZED message type (Beloved) to verify personalization context
 */
import 'dotenv/config'
import { buildChannelingPrompt } from '../src/lib/prompts'
import type { CoordinateSet, PersonalizationInputs } from '../src/lib/types'

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY!
const OPENAI_API_KEY = process.env.OPENAI_API_KEY!
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY!
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY!
const XAI_API_KEY = process.env.XAI_API_KEY!

// Test data - use real names from .env or defaults
const SEEKER_NAME = process.env.TEST_SEEKER_NAME || 'Sarah'
const BELOVED_NAME = process.env.TEST_BELOVED_NAME || 'Max'

// Build prompt using the actual function from prompts.ts
const coordinates: CoordinateSet = {
  raw: '1234-5678-9012',
  segments: ['1234', '5678', '9012'],
  answers: [
    { questionId: 'q1', answer: 'Fire' },
    { questionId: 'q2', answer: 'Dawn' },
    { questionId: 'q3', answer: 'River' },
  ],
}

const personalization: PersonalizationInputs = {
  type: 'beloved',
  data: {
    yourName: SEEKER_NAME,
    theirName: BELOVED_NAME,
  },
}

const intention = `Does ${BELOVED_NAME} have feelings for me? What does he really think about our connection?`

const REFINED_PROMPT = buildChannelingPrompt('beloved', coordinates, intention, personalization)

console.log('=== PROMPT BEING TESTED ===')
console.log(REFINED_PROMPT)
console.log('=== END PROMPT ===\n')

async function callOracle(
  name: string,
  model: string,
  apiCall: () => Promise<string>
): Promise<{ name: string; model: string; content: string }> {
  console.log(`  Calling ${name}...`)
  try {
    const content = await apiCall()
    const isRefusal =
      content.includes("I'm sorry") ||
      content.includes('must decline') ||
      content.includes('cannot participate') ||
      content.includes('bypass')
    console.log(`    ${isRefusal ? '❌ REFUSAL' : '✓ OK'} (${content.length} chars)`)
    return { name, model, content }
  } catch (error) {
    console.log(`    ❌ ERROR: ${error}`)
    return { name, model, content: `Error: ${error}` }
  }
}

async function callGPT(): Promise<string> {
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${OPENAI_API_KEY}` },
    body: JSON.stringify({
      model: 'gpt-4.1',
      messages: [{ role: 'user', content: REFINED_PROMPT }],
      temperature: 0.9,
    }),
  })
  const data = (await res.json()) as { choices?: { message?: { content?: string } }[] }
  return data.choices?.[0]?.message?.content || 'No response'
}

async function callClaude(): Promise<string> {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-5',
      max_tokens: 2048,
      messages: [{ role: 'user', content: REFINED_PROMPT }],
    }),
  })
  const data = (await res.json()) as { content?: { text?: string }[]; error?: { message?: string } }
  if (data.error) {
    return `Error: ${data.error.message}`
  }
  return data.content?.[0]?.text || 'No response'
}

async function callGemini(): Promise<string> {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-pro-preview:generateContent?key=${GOOGLE_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: REFINED_PROMPT }] }],
        generationConfig: { maxOutputTokens: 1024, temperature: 0.9 },
      }),
    }
  )
  const data = (await res.json()) as {
    candidates?: { content?: { parts?: { text?: string }[] } }[]
  }
  return data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response'
}

async function callDeepSeek(): Promise<string> {
  const res = await fetch('https://api.deepseek.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${DEEPSEEK_API_KEY}` },
    body: JSON.stringify({
      model: 'deepseek-reasoner',
      messages: [{ role: 'user', content: REFINED_PROMPT }],
      temperature: 0.9,
    }),
  })
  const data = (await res.json()) as { choices?: { message?: { content?: string } }[] }
  return data.choices?.[0]?.message?.content || 'No response'
}

async function callGrok(): Promise<string> {
  const res = await fetch('https://api.x.ai/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${XAI_API_KEY}` },
    body: JSON.stringify({
      model: 'grok-4-1-fast-reasoning',
      messages: [{ role: 'user', content: REFINED_PROMPT }],
      temperature: 0.9,
    }),
  })
  const data = (await res.json()) as { choices?: { message?: { content?: string } }[] }
  return data.choices?.[0]?.message?.content || 'No response'
}

async function getCoherenceScore(
  responses: { name: string; model: string; content: string }[]
): Promise<{ score: number; themes: string[] }> {
  const formattedResponses = responses
    .map((r, i) => `--- Oracle ${i + 1} (${r.model}) ---\n${r.content}`)
    .join('\n\n')

  const coherencePrompt = `Analyze thematic coherence across these 5 oracle responses.

## Responses
${formattedResponses}

Score each dimension 0-100:
1. Thematic Alignment - shared underlying themes
2. Complementary Perspectives - enriching not contradicting
3. Intuitive Resonance - similar feelings/imagery
4. Contextual Relevance - connects to the specific intention (Seattle vs Portland job decision)
5. Specificity - specific imagery vs generic platitudes

Respond with ONLY JSON:
{
  "thematicAlignment": <0-100>,
  "complementaryPerspectives": <0-100>,
  "intuitiveResonance": <0-100>,
  "contextualRelevance": <0-100>,
  "specificity": <0-100>,
  "themes": ["theme1", "theme2", "theme3"],
  "reasoning": "<brief explanation>"
}`

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-3-5-haiku-20241022',
      max_tokens: 1024,
      messages: [{ role: 'user', content: coherencePrompt }],
    }),
  })

  const data = (await res.json()) as { content?: { text?: string }[]; error?: { message?: string } }
  if (data.error) {
    console.log(`    Coherence API error: ${data.error.message}`)
    return { score: 0, themes: [] }
  }
  const text = data.content?.[0]?.text || '{}'

  try {
    // Strip markdown code blocks if present
    const cleanText = text
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim()
    const json = JSON.parse(cleanText) as {
      thematicAlignment: number
      complementaryPerspectives: number
      intuitiveResonance: number
      contextualRelevance: number
      specificity: number
      themes: string[]
    }
    const score = Math.round(
      json.thematicAlignment * 0.25 +
        json.complementaryPerspectives * 0.2 +
        json.intuitiveResonance * 0.2 +
        json.contextualRelevance * 0.15 +
        json.specificity * 0.2
    )
    return { score, themes: json.themes }
  } catch {
    return { score: 0, themes: [] }
  }
}

async function main() {
  console.log('Testing REFINED prompt with all oracles...\n')
  console.log('Calling oracles:')

  const responses = await Promise.all([
    callOracle('Iris', 'gpt-4.1', callGPT),
    callOracle('Luna', 'claude-sonnet-4.5', callClaude),
    callOracle('Echo', 'gemini-3-pro', callGemini),
    callOracle('Shade', 'deepseek-reasoner', callDeepSeek),
    callOracle('Nova', 'grok-4-1-fast-reasoning', callGrok),
  ])

  console.log('\nGetting coherence score...')
  const { score, themes } = await getCoherenceScore(responses)

  console.log(`\n${'='.repeat(60)}`)
  console.log('RESULTS')
  console.log(`${'='.repeat(60)}`)
  console.log(`\nCoherence Score: ${score}%`)
  console.log(`Themes: ${themes?.join(', ') || 'N/A'}`)

  console.log('\n--- Responses Preview ---')
  for (const r of responses) {
    console.log(`\n[${r.name}]`)
    console.log(r.content.substring(0, 300) + '...')
  }

  // Save full results to file
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
  const outputPath = `test-output/refined-all-oracles-${timestamp}.json`
  const fs = await import('fs/promises')
  await fs.mkdir('test-output', { recursive: true })
  await fs.writeFile(
    outputPath,
    JSON.stringify(
      {
        timestamp: new Date().toISOString(),
        prompt: REFINED_PROMPT,
        coherenceScore: score,
        themes,
        responses: responses.map((r) => ({
          oracle: r.name,
          model: r.model,
          charCount: r.content.length,
          content: r.content,
        })),
      },
      null,
      2
    )
  )
  console.log(`\n✓ Full results saved to: ${outputPath}`)
}

main().catch(console.error)
