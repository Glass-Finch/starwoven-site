/**
 * Test prompt refinement with baseline and validation trials
 *
 * Usage:
 *   npx tsx scripts/test-prompt-refinement.ts beloved baseline 3
 *   npx tsx scripts/test-prompt-refinement.ts beloved validate 5
 */
import 'dotenv/config'
import * as fs from 'fs'
import * as path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY!
const OPENAI_API_KEY = process.env.OPENAI_API_KEY!
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY!
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY!
const XAI_API_KEY = process.env.XAI_API_KEY!

// Test data from .env
// Custom intention can be passed as 4th argument
const customIntention = process.argv[5]

const DEFAULT_INTENTIONS: Record<string, string> = {
  beloved: 'What does he really think about our future together?',
  ancestor: 'What would you tell me about my path right now?',
  sage: 'What should I focus on right now?',
  cosmos: 'What do I need to hear right now?',
  crossroads: 'Should I take the new job in Seattle or stay close to my family in Portland?',
  calling: 'What is my purpose?',
}

const TEST_DATA: Record<string, Record<string, string>> = {
  beloved: {
    yourName: process.env.TEST_SEEKER_NAME || 'Maki',
    theirName: process.env.TEST_BELOVED_NAME || 'Frank',
  },
  ancestor: {
    yourName: process.env.TEST_SEEKER_NAME || 'Maki',
    theirName: process.env.TEST_ANCESTOR_NAME || 'Fred',
    relationship: process.env.TEST_ANCESTOR_RELATIONSHIP || 'grandfather',
  },
  sage: {
    yourName: process.env.TEST_SEEKER_NAME || 'Maki',
    birthday: process.env.TEST_SEEKER_BIRTHDAY || '1986-09-23',
  },
  cosmos: {},
  crossroads: {},
  calling: {
    yourName: process.env.TEST_SEEKER_NAME || 'Maki',
    birthday: process.env.TEST_SEEKER_BIRTHDAY || '1986-09-23',
  },
}

import { buildChannelingPrompt, buildAnalysisPrompt } from '../src/lib/prompts'
import type { MessageType, CoherenceRubric } from '../src/lib/types'

interface TrialResult {
  trial: number
  rubric: CoherenceRubric
  score: number
  themes: string[]
  genericPhrases: string[]
}

// API call functions are intentionally duplicated from src/lib/ai.ts.
// Scripts use simpler implementations without AbortController/timeouts.
async function callOpenAI(prompt: string): Promise<string> {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'gpt-4.1',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 1024,
    }),
  })
  const data = await response.json()
  return data.choices?.[0]?.message?.content || ''
}

async function callAnthropic(prompt: string, model: string): Promise<string> {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model,
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }],
    }),
  })
  const data = await response.json()
  return data.content?.[0]?.text || ''
}

async function callGemini(prompt: string): Promise<string> {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-pro-preview:generateContent?key=${GOOGLE_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { maxOutputTokens: 4096, temperature: 0.8 },
      }),
    }
  )
  const data = await response.json()
  return data.candidates?.[0]?.content?.parts?.[0]?.text || ''
}

async function callDeepSeek(prompt: string): Promise<string> {
  const response = await fetch('https://api.deepseek.com/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${DEEPSEEK_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'deepseek-reasoner',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 1024,
    }),
  })
  const data = await response.json()
  return data.choices?.[0]?.message?.content || ''
}

async function callGrok(prompt: string): Promise<string> {
  const response = await fetch('https://api.x.ai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${XAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'grok-4-1-fast-reasoning',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 1024,
    }),
  })
  const data = await response.json()
  return data.choices?.[0]?.message?.content || ''
}

async function callAllOracles(prompt: string): Promise<{ model: string; content: string }[]> {
  console.log('  Calling all 5 oracles...')

  const results = await Promise.allSettled([
    callOpenAI(prompt).then((content) => ({ model: 'gpt-4.1', content })),
    callAnthropic(prompt, 'claude-sonnet-4-5').then((content) => ({
      model: 'claude-sonnet-4.5',
      content,
    })),
    callGemini(prompt).then((content) => ({ model: 'gemini-3.0-pro', content })),
    callDeepSeek(prompt).then((content) => ({ model: 'deepseek-reasoner', content })),
    callGrok(prompt).then((content) => ({ model: 'grok-4-1-fast-reasoning', content })),
  ])

  const responses: { model: string; content: string }[] = []
  for (const result of results) {
    if (result.status === 'fulfilled' && result.value.content) {
      responses.push(result.value)
    }
  }

  console.log(`  Got ${responses.length}/5 responses`)
  return responses
}

async function getCoherenceScore(
  responses: { model: string; content: string }[],
  intention: string,
  messageType: MessageType
): Promise<{ rubric: CoherenceRubric; score: number; themes: string[]; genericPhrases: string[] }> {
  const prompt = buildAnalysisPrompt(responses, intention, messageType)
  const text = await callAnthropic(prompt, 'claude-sonnet-4-5')

  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error('No JSON found')

    const result = JSON.parse(jsonMatch[0])
    const rubric: CoherenceRubric = {
      thematicAlignment: result.rubric?.thematicAlignment ?? 75,
      complementaryPerspectives: result.rubric?.complementaryPerspectives ?? 75,
      intuitiveResonance: result.rubric?.intuitiveResonance ?? 75,
      contextualRelevance: result.rubric?.contextualRelevance ?? 75,
      specificity: result.rubric?.specificity ?? 75,
    }

    const score = Math.round(
      rubric.thematicAlignment * 0.25 +
        rubric.complementaryPerspectives * 0.2 +
        rubric.intuitiveResonance * 0.2 +
        rubric.contextualRelevance * 0.15 +
        rubric.specificity * 0.2
    )

    return {
      rubric,
      score,
      themes: result.themeOverlap || [],
      genericPhrases: result.genericPhrases || [],
    }
  } catch {
    return {
      rubric: {
        thematicAlignment: 75,
        complementaryPerspectives: 75,
        intuitiveResonance: 75,
        contextualRelevance: 75,
        specificity: 75,
      },
      score: 75,
      themes: [],
      genericPhrases: [],
    }
  }
}

function buildTestCoordinates(): { raw: string; questions: []; answers: [] } {
  // Generate random coordinates for testing
  const coords = Array.from({ length: 4 }, () =>
    Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, '0')
  ).join('-')
  return { raw: coords, questions: [], answers: [] }
}

async function runTrial(messageType: MessageType, trialNum: number): Promise<FullTrialResult> {
  console.log(`\nTrial ${trialNum}...`)

  const testData = TEST_DATA[messageType]
  const intention = customIntention || DEFAULT_INTENTIONS[messageType]
  const coordinates = buildTestCoordinates()

  // Build personalization based on message type
  let personalization: { type: MessageType; data: Record<string, string> } | undefined

  if (messageType === 'beloved') {
    personalization = {
      type: 'beloved',
      data: { yourName: testData.yourName!, theirName: testData.theirName! },
    }
  } else if (messageType === 'ancestor') {
    personalization = {
      type: 'ancestor',
      data: {
        yourName: testData.yourName!,
        theirName: testData.theirName!,
        relationship: (testData as typeof TEST_DATA.ancestor).relationship,
      },
    }
  } else if (messageType === 'sage' || messageType === 'calling') {
    personalization = {
      type: messageType,
      data: {
        yourName: testData.yourName!,
        birthday: (testData as typeof TEST_DATA.sage).birthday,
      },
    }
  }

  // Build and send channeling prompt
  const channelingPrompt = buildChannelingPrompt(
    messageType,
    coordinates,
    intention,
    personalization
  )

  // Call all oracles
  const responses = await callAllOracles(channelingPrompt)

  if (responses.length < 3) {
    console.log('  Not enough responses, skipping coherence check')
    return {
      trial: trialNum,
      rubric: {
        thematicAlignment: 0,
        complementaryPerspectives: 0,
        intuitiveResonance: 0,
        contextualRelevance: 0,
        specificity: 0,
      },
      score: 0,
      themes: [],
      genericPhrases: [],
      responses,
      intention: intention,
    }
  }

  // Get coherence score
  const { rubric, score, themes, genericPhrases } = await getCoherenceScore(
    responses,
    intention,
    messageType
  )

  console.log(
    `  Score: ${score}% [T:${rubric.thematicAlignment} C:${rubric.complementaryPerspectives} R:${rubric.intuitiveResonance} X:${rubric.contextualRelevance} S:${rubric.specificity}]`
  )
  if (themes.length > 0) console.log(`  Themes: ${themes.join(', ')}`)
  if (genericPhrases.length > 0) console.log(`  Generic phrases: ${genericPhrases.join(', ')}`)

  return {
    trial: trialNum,
    rubric,
    score,
    themes,
    genericPhrases,
    responses,
    intention: intention,
  }
}

interface FullTrialResult extends TrialResult {
  responses: { model: string; content: string }[]
  intention: string
}

function saveResponsesForReview(results: FullTrialResult[], messageType: string, phase: string) {
  const outputDir = path.join(__dirname, '..', 'test-output', messageType)
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true })
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
  const filename = `${messageType}-${phase}-${timestamp}.md`
  const filepath = path.join(outputDir, filename)

  let content = `# ${messageType.toUpperCase()} - ${phase.toUpperCase()} TRIALS\n\n`
  content += `Generated: ${new Date().toISOString()}\n\n`
  content += `---\n\n`

  for (const result of results) {
    content += `## Trial ${result.trial}\n\n`
    content += `**Intention:** ${result.intention}\n\n`
    content += `**Coherence Score:** ${result.score}%\n`
    content += `- Thematic Alignment: ${result.rubric.thematicAlignment}\n`
    content += `- Complementary Perspectives: ${result.rubric.complementaryPerspectives}\n`
    content += `- Intuitive Resonance: ${result.rubric.intuitiveResonance}\n`
    content += `- Contextual Relevance: ${result.rubric.contextualRelevance}\n`
    content += `- Specificity: ${result.rubric.specificity}\n\n`

    if (result.themes.length > 0) {
      content += `**Themes:** ${result.themes.join(', ')}\n\n`
    }

    content += `### Responses\n\n`
    for (const resp of result.responses) {
      content += `#### ${resp.model}\n\n`
      content += `${resp.content}\n\n`
      content += `---\n\n`
    }
  }

  // Add user story checklist for manual review
  content += `## Manual Review Checklist\n\n`
  content += `Based on USER-STORIES.md, check each response against expected qualities:\n\n`

  if (messageType === 'beloved') {
    content += `### The Beloved Expected Qualities\n`
    content += `- [ ] Addresses seeker by name naturally\n`
    content += `- [ ] References the beloved naturally (not forced)\n`
    content += `- [ ] Speaks to uncertainty and possibility\n`
    content += `- [ ] Does NOT give direct yes/no answers\n`
    content += `- [ ] Feels personal, not generic fortune cookie\n`
    content += `- [ ] No theatrical "speaking as" the beloved\n`
    content += `- [ ] Follows voice guidelines (understated, no New Age cliches)\n`
  } else if (messageType === 'ancestor') {
    content += `### The Ancestor Expected Qualities\n`
    content += `- [ ] Warm, comforting tone\n`
    content += `- [ ] Uses names naturally\n`
    content += `- [ ] Does NOT claim to BE the ancestor\n`
    content += `- [ ] Offers peace without false promises\n`
    content += `- [ ] Sensitive to grief context\n`
    content += `- [ ] No theatrical performance\n`
  } else if (messageType === 'sage') {
    content += `### The Sage Expected Qualities\n`
    content += `- [ ] Speaks AS future self, TO present self\n`
    content += `- [ ] References age/life stage appropriately\n`
    content += `- [ ] Doesn't give direct yes/no answers\n`
    content += `- [ ] Offers perspective, not prescription\n`
    content += `- [ ] Feels like self-reflection, not external advice\n`
  } else if (messageType === 'cosmos') {
    content += `### The Cosmos Expected Qualities\n`
    content += `- [ ] Responds to openness with openness\n`
    content += `- [ ] Doesn't invent specific issues\n`
    content += `- [ ] Feels like a mirror, not a lecture\n`
    content += `- [ ] Comfortable with ambiguity\n`
  } else if (messageType === 'crossroads') {
    content += `### The Crossroads Expected Qualities\n`
    content += `- [ ] Acknowledges the weight of the decision\n`
    content += `- [ ] Gives directional guidance (leans one way)\n`
    content += `- [ ] Doesn't cop out with "only you know"\n`
    content += `- [ ] Still leaves room for agency\n`
  } else if (messageType === 'calling') {
    content += `### The Calling Expected Qualities\n`
    content += `- [ ] Addresses seeker by name\n`
    content += `- [ ] Uses age context appropriately\n`
    content += `- [ ] Doesn't prescribe specific career\n`
    content += `- [ ] Speaks to deeper purpose\n`
    content += `- [ ] Feels like recognition, not assignment\n`
  }

  fs.writeFileSync(filepath, content)
  console.log(`\nResponses saved for review: ${filepath}`)
}

function analyzeResults(results: FullTrialResult[], phase: string) {
  console.log('\n' + '='.repeat(60))
  console.log(`${phase.toUpperCase()} RESULTS`)
  console.log('='.repeat(60))

  const validResults = results.filter((r) => r.score > 0)
  if (validResults.length === 0) {
    console.log('No valid results')
    return
  }

  const scores = validResults.map((r) => r.score)
  const avg = scores.reduce((a, b) => a + b, 0) / scores.length
  const min = Math.min(...scores)
  const max = Math.max(...scores)

  console.log(`\nOverall Score:`)
  console.log(`  Average: ${avg.toFixed(1)}%`)
  console.log(`  Range: ${min}-${max}% (variance: ${max - min}%)`)

  // Per-dimension averages
  const dims = [
    'thematicAlignment',
    'complementaryPerspectives',
    'intuitiveResonance',
    'contextualRelevance',
    'specificity',
  ] as const
  console.log(`\nPer-Dimension Averages:`)
  for (const dim of dims) {
    const vals = validResults.map((r) => r.rubric[dim])
    const dimAvg = vals.reduce((a, b) => a + b, 0) / vals.length
    const dimMin = Math.min(...vals)
    const dimMax = Math.max(...vals)
    console.log(`  ${dim}: ${dimAvg.toFixed(1)} (range: ${dimMin}-${dimMax})`)
  }

  // Common themes
  const allThemes = validResults.flatMap((r) => r.themes)
  const themeCounts = allThemes.reduce(
    (acc, t) => {
      acc[t] = (acc[t] || 0) + 1
      return acc
    },
    {} as Record<string, number>
  )
  const commonThemes = Object.entries(themeCounts)
    .filter(([, count]) => count > 1)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)

  if (commonThemes.length > 0) {
    console.log(`\nCommon Themes:`)
    for (const [theme, count] of commonThemes) {
      console.log(`  - ${theme} (${count}x)`)
    }
  }

  // Generic phrases detected
  const allGeneric = validResults.flatMap((r) => r.genericPhrases)
  if (allGeneric.length > 0) {
    console.log(`\nGeneric Phrases Detected:`)
    for (const phrase of [...new Set(allGeneric)]) {
      console.log(`  - "${phrase}"`)
    }
  }
}

async function main() {
  const [, , messageType, phase, numTrials] = process.argv

  if (!messageType || !phase || !numTrials) {
    console.log(
      'Usage: npx tsx scripts/test-prompt-refinement.ts <messageType> <baseline|validate> <numTrials>'
    )
    console.log('Example: npx tsx scripts/test-prompt-refinement.ts beloved baseline 3')
    process.exit(1)
  }

  if (!TEST_DATA[messageType as MessageType]) {
    console.log(`Invalid message type: ${messageType}`)
    console.log('Valid types: beloved, ancestor, sage, cosmos, crossroads, calling')
    process.exit(1)
  }

  const trials = parseInt(numTrials, 10)
  const usedIntention = customIntention || DEFAULT_INTENTIONS[messageType]
  console.log(`\nTesting ${messageType} - ${phase} phase (${trials} trials)`)
  console.log(`Test data:`, { ...TEST_DATA[messageType as MessageType], intention: usedIntention })

  const results: FullTrialResult[] = []

  for (let i = 1; i <= trials; i++) {
    const result = await runTrial(messageType as MessageType, i)
    results.push(result)

    // Delay between trials
    if (i < trials) {
      await new Promise((r) => setTimeout(r, 2000))
    }
  }

  analyzeResults(results, phase)

  // Save responses for manual review
  saveResponsesForReview(results, messageType, phase)
}

main().catch(console.error)
