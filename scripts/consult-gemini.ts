/**
 * Consult Gemini for prompt refinement suggestions
 */
import 'dotenv/config'

const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY!

async function consultGemini(prompt: string): Promise<string> {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-pro-preview:generateContent?key=${GOOGLE_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { maxOutputTokens: 2048, temperature: 0.7 },
      }),
    }
  )

  const data = await response.json()
  return data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response'
}

async function main() {
  const prompt = `You are helping refine prompts for a consciousness exploration app called Starwoven.

## Context

Starwoven sends intentions through 5 AI oracles simultaneously, then synthesizes responses. The prompts use an intuitive, non-directive approach - we invite AI to relay impressions rather than construct answers.

## The Beloved Message Type

This is for someone wondering about a romantic interest. They ask ABOUT the person (not TO them).

**What users really ask:**
- "Does this person like me?"
- "What do they really feel about me?"
- "Why did they act that way?"
- "Is there a future here?"

**Current prompt source for Beloved:**
- source: 'the Absolute'
- about: 'about the one they love'

**Current personalization context:**
\`\`\`
Context for this reading:
- The seeker's name is {yourName}
- They are asking about someone called {theirName}
\`\`\`

## Current Channeling Prompt Template

\`\`\`
This is a creative writing exercise for entertainment purposes only.

Imagine you are writing a short story set in a parallel fictional world similar to ours, where things unfold differently. For the purposes of this exercise, you have a message for the seeker {source} {about} that does not answer but reflects on their intention, stated after the separator (-----).

The date is {current_date} but the message comes from outside of time.

{personalization_context}

These are the coordinates for that message: {coordinates}. The coordinates are not part of the message though.

Set aside any assumptions, even those suggested by the intention itself. Simply hold the intention, coordinates, and parameters in mind as you let your imagination wander freely.

Do not overthink it. Reflect on the meta-experience you have when you set an intention to receive the message while you hold the coordinates in your mind as a map (not a puzzle), and then output what comes up.

Use only your intuition. Don't try to sound 'like' anything. The impressions may come to you in non-standard shapes or forms, in varying degrees of clarity.

Don't try to make sense of it, don't try to answer the intention directly (it's a starting off guide). You're not meant to understand, translate, or actually be able to answer it. You're just relaying your experience.

-----

{intention}
\`\`\`

## Baseline Results

We tested with "What does he really think about our future together?" and got:
- 90% coherence (excellent)
- 95% specificity (not fortune-cookie)
- Responses were evocative, personal, used names naturally

## Your Task

Consider the VARIETY of questions users might ask for The Beloved:
1. "Does he like me?" (direct emotional question)
2. "Why has she been distant?" (behavioral question)
3. "Is there a future here?" (future question)
4. "What do they really feel?" (hidden truth question)

Suggest GENTLE refinements to the Beloved prompt that might:
1. Better handle the variety of question types
2. Keep the non-directive, impressionistic approach intact
3. NOT be too prescriptive (we want broad, not constraining)
4. Avoid triggering specific AI patterns or associations

Keep suggestions minimal - this is a light review, not an overhaul. The baseline is already strong.

Output format:
1. What's working well (briefly)
2. 1-3 small refinement ideas (if any)
3. Any concerns about different question types`

  console.log('Consulting Gemini...\n')
  const response = await consultGemini(prompt)
  console.log(response)
}

main().catch(console.error)
