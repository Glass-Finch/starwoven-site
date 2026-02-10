/**
 * Consult Gemini for prompt refinement suggestions
 *
 * Usage: npx tsx scripts/consult-gemini.ts <messageType>
 */
import 'dotenv/config'
import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY!

const MESSAGE_TYPE_INFO: Record<
  string,
  {
    description: string
    source: string
    about: string
    userQuestions: string[]
    personalization: string
  }
> = {
  beloved: {
    description:
      'For someone wondering about a romantic interest. They ask ABOUT the person (not TO them).',
    source: 'the Absolute',
    about: 'about the one they love',
    userQuestions: [
      '"Does this person like me?"',
      '"What do they really feel about me?"',
      '"Why did they act that way?"',
      '"Is there a future here?"',
    ],
    personalization: `- The seeker's name is {yourName}
- The focus is the connection between {yourName} and {theirName}`,
  },
  ancestor: {
    description:
      'For someone seeking connection with a deceased loved one. Messages come from beyond the veil, NOT claiming to be the ancestor.',
    source: 'beyond the veil',
    about: 'from the one who has crossed over',
    userQuestions: [
      '"What would grandma say to me right now?"',
      '"Is dad at peace?"',
      '"What message does my ancestor have for me?"',
      '"I miss them so much - is there anything they want me to know?"',
    ],
    personalization: `- The seeker's name is {yourName}
- They are reaching for {theirName}, their {relationship}, who has crossed over`,
  },
  sage: {
    description:
      'For someone seeking wisdom from their future self. The message comes from further along their timeline - who they are becoming.',
    source: 'a point further along the timeline',
    about: 'from who they are becoming',
    userQuestions: [
      '"What should I focus on right now?"',
      '"What do I need to know about my path?"',
      '"What would my future self tell me?"',
      '"Am I on the right track?"',
    ],
    personalization: `- The seeker's name is {yourName}
- They were born on {birthday} (currently {age})`,
  },
  cosmos: {
    description:
      'For someone seeking cosmic perspective. Messages from the universal field, the Absolute, the greater pattern.',
    source: 'the Absolute',
    about: 'from the cosmic field',
    userQuestions: [
      '"What is my place in the universe?"',
      '"What does the cosmos want me to know?"',
      '"What larger pattern am I part of?"',
      '"What is the meaning of this moment?"',
    ],
    personalization: '(No personalization - universal message)',
  },
  crossroads: {
    description:
      'For someone facing a significant decision. Messages from the space between paths, illuminating the choice.',
    source: 'the space between paths',
    about: 'regarding the divergence before them',
    userQuestions: [
      '"Should I take this job or stay where I am?"',
      '"Which path is right for me?"',
      '"What am I not seeing about this decision?"',
      '"What do I need to consider?"',
    ],
    personalization: '(Decision context provided in intention)',
  },
  calling: {
    description:
      'For someone seeking their purpose or role. Messages from the collective about their place in the greater pattern.',
    source: 'the collective',
    about: 'about their role in the greater pattern',
    userQuestions: [
      '"What is my calling?"',
      '"What am I meant to do?"',
      '"How can I contribute to the world?"',
      '"What gifts should I be sharing?"',
    ],
    personalization: `- The seeker's name is {yourName}
- They were born on {birthday} (currently {age})`,
  },
}

async function consultGemini(prompt: string): Promise<string> {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-pro-preview:generateContent?key=${GOOGLE_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { maxOutputTokens: 8192, temperature: 0.7 },
      }),
    }
  )

  const data = await response.json()
  return data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response'
}

async function main() {
  const messageType = process.argv[2]

  if (!messageType || !MESSAGE_TYPE_INFO[messageType]) {
    console.error('Usage: npx tsx scripts/consult-gemini.ts <messageType>')
    console.error('Valid types:', Object.keys(MESSAGE_TYPE_INFO).join(', '))
    process.exit(1)
  }

  const info = MESSAGE_TYPE_INFO[messageType]

  // Read documentation files for context
  const claudeMd = readFileSync(join(__dirname, '../CLAUDE.md'), 'utf-8')
  const userStoriesMd = readFileSync(join(__dirname, '../docs/USER-STORIES.md'), 'utf-8')
  const promptsMd = readFileSync(join(__dirname, '../docs/PROMPTS.md'), 'utf-8')
  const promptsTs = readFileSync(join(__dirname, '../src/lib/prompts.ts'), 'utf-8')

  const prompt = `You are helping refine prompts for a consciousness exploration app called Starwoven.

## Documentation Context

### CLAUDE.md (Project Overview)
${claudeMd}

### USER-STORIES.md (User Experience Requirements)
${userStoriesMd}

### PROMPTS.md (Prompt Philosophy)
${promptsMd}

### Current prompts.ts Implementation
\`\`\`typescript
${promptsTs}
\`\`\`

---

## Your Task: Review "${messageType.charAt(0).toUpperCase() + messageType.slice(1)}" Message Type

**Description:** ${info.description}

**Current prompt source:**
- source: '${info.source}'
- about: '${info.about}'

**Current personalization context:**
${info.personalization}

**What users really ask:**
${info.userQuestions.map((q) => `- ${q}`).join('\n')}

## Important Constraints

1. **GENTLE refinements only** - the current approach is working well
2. **BROAD instructions** - avoid specificity that constrains the AI
3. **No model associations** - avoid language that triggers specific AI patterns
4. **Don't focus on names** - Opus (synthesizer) handles weaving names in
5. **Keep the non-directive philosophy** - we invite impressions, not answers

## Output Format

1. **What's working well** (1-2 sentences)
2. **Gentle refinement suggestions** (0-2 small ideas, if any)
3. **Any concerns** about the message type or edge cases

Keep it minimal. This is fine-tuning, not redesign.`

  console.log(`Consulting Gemini for "${messageType}" refinement...\n`)
  const response = await consultGemini(prompt)
  console.log(response)
}

main().catch(console.error)
