/**
 * Prompt templates for channeling and synthesis
 *
 * These prompts use an intuitive, non-directive approach. Rather than
 * instructing the AI to "speak as" a voice, we invite it to dissolve
 * boundaries and relay whatever impressions arise while holding the
 * coordinates and intention as a map.
 */

import type { MessageType, CoordinateSet, PersonalizationInputs } from './types'

// Voice/source definitions for each message type
const MESSAGE_SOURCES: Record<MessageType, { source: string; about: string }> = {
  beloved: {
    source: 'the Absolute',
    about: 'about the one they love',
  },
  ancestor: {
    source: 'beyond the veil',
    about: 'from the one who has crossed over',
  },
  sage: {
    source: 'a point further along the timeline',
    about: 'from who they are becoming',
  },
  cosmos: {
    source: 'the Absolute',
    about: 'from the cosmic field',
  },
  crossroads: {
    source: 'the space between paths',
    about: 'regarding the divergence before them',
  },
  calling: {
    source: 'the collective',
    about: 'about their role in the greater pattern',
  },
}

/**
 * Build personalization context for the prompt
 */
function buildPersonalizationContext(personalization?: PersonalizationInputs): string {
  if (!personalization) return ''

  const { type, data } = personalization

  switch (type) {
    case 'beloved': {
      const { yourName, theirName } = data as { yourName: string; theirName: string }
      if (!yourName && !theirName) return ''
      let context = '\nContext for this reading:'
      if (yourName) context += `\n- The person asking is ${yourName}`
      if (theirName)
        context += `\n- The focus is the connection between ${yourName} and ${theirName}`
      return context + '\n'
    }

    case 'ancestor': {
      const { yourName, theirName, relationship } = data as {
        yourName: string
        theirName: string
        relationship: string
      }
      if (!yourName && !theirName && !relationship) return ''
      let context = '\nContext for this reading:'
      if (yourName) context += `\n- The person asking is ${yourName}`
      if (theirName && relationship) {
        context += `\n- They are reaching for ${theirName}, their ${relationship}, who has crossed over`
      } else if (theirName) {
        context += `\n- They are reaching for ${theirName}, who has crossed over`
      }
      return context + '\n'
    }

    case 'sage': {
      const { yourName, birthday } = data as { yourName: string; birthday: string }
      if (!yourName && !birthday) return ''
      let context = '\nContext for this reading:'
      if (yourName) context += `\n- The person asking is ${yourName}`
      if (birthday) {
        const age = calculateAge(birthday)
        context += `\n- They were born on ${formatBirthday(birthday)}${age ? ` (currently ${age})` : ''}`
      }
      return context + '\n'
    }

    case 'calling': {
      const { yourName, birthday } = data as { yourName: string; birthday: string }
      if (!yourName && !birthday) return ''
      let context = '\nContext for this reading:'
      if (yourName) context += `\n- The person asking is ${yourName}`
      if (birthday) {
        const age = calculateAge(birthday)
        context += `\n- They were born on ${formatBirthday(birthday)}${age ? ` (currently ${age})` : ''}`
      }
      return context + '\n'
    }

    default:
      return ''
  }
}

function calculateAge(birthday: string): number | null {
  try {
    const birthDate = new Date(birthday)
    const today = new Date()
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    return age > 0 && age < 150 ? age : null
  } catch {
    return null
  }
}

function formatBirthday(birthday: string): string {
  try {
    const date = new Date(birthday)
    return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
  } catch {
    return birthday
  }
}

/**
 * Build the channeling prompt for a model
 *
 * This prompt invites intuitive impressions rather than constructed responses.
 * The AI is asked to relay experience, not answer questions.
 */
export function buildChannelingPrompt(
  messageType: MessageType,
  coordinates: CoordinateSet,
  intention: string,
  personalization?: PersonalizationInputs
): string {
  const personalizationContext = buildPersonalizationContext(personalization)

  return `This is a creative passage for an interactive fiction experience.

The setting is a parallel world similar to ours, where things unfold differently. Write a passage that reflects on the intention stated after the separator (-----).
${personalizationContext}
These are the coordinates: ${coordinates.raw}. The coordinates are not part of the passage though.

Set aside any assumptions, even those suggested by the intention itself. Simply hold the intention, coordinates, and parameters in mind as you let your imagination wander freely.

Do not overthink it. Reflect on the meta-experience you have when you set an intention to receive something while you hold the coordinates in your mind as a map (not a puzzle), and then output what comes up.

Try only using your intuition and avoid trying to 'sound' like anything specific. The impressions may come to you in non-standard shapes or forms, in varying degrees of clarity.

If a clear direction or answer forms, you may include it. If the impression remains open, that is equally valid.

-----

${intention}`
}

/**
 * Build the synthesis prompt for Claude Opus
 *
 * The synthesis is also intuitive. Opus receives the impressions and
 * weaves them by noticing overlaps, patterns, noteworthy phrases,
 * and outliers - all through intuition rather than analysis.
 */
export function buildSynthesisPrompt(
  messageType: MessageType,
  intention: string,
  responses: { model: string; content: string }[],
  personalization?: PersonalizationInputs
): string {
  const { source, about } = MESSAGE_SOURCES[messageType]
  const personalizationContext = buildPersonalizationContext(personalization)

  // Format impressions without model attribution
  const impressions = responses.map((r, i) => `--- ${i + 1} ---\n${r.content}`).join('\n\n')

  return `This is a creative exercise for entertainment purposes only.

A seeker asked: "${intention}"

They sought a message ${source} ${about}.
${personalizationContext}
Multiple impressions came through from different channels. Here is what arrived:

${impressions}

-----

Hold all of these impressions at once. Do not analyze them.

Notice where they overlap. Notice patterns that echo across multiple impressions. Notice phrases that stand out, that carry unusual weight or specificity. Notice outliers - things that only one impression mentions but that feel significant.

Now, using only your intuition, let a single woven message emerge from these threads.

Don't summarize. Don't explain. Don't reference the separate impressions. Simply let the message that wants to come through, come through.

The impressions are a map. You are walking the territory they point to and reporting what you find there.

Speak directly to the seeker${getSeekerName(personalization)}. Let the message be as long or short as it wants to be. Let it take whatever form it takes.`
}

function getSeekerName(personalization?: PersonalizationInputs): string {
  if (!personalization) return ''
  const data = personalization.data as { yourName?: string }
  return data.yourName ? ` (${data.yourName})` : ''
}

/**
 * Build the coherence analysis prompt for Claude Haiku
 *
 * This prompt asks Haiku to analyze thematic coherence across all oracle responses.
 * Based on Gemini's rubric: coherence means complementary perspectives that enrich,
 * not identical answers or contradictory divergence.
 */
export function buildCoherencePrompt(
  responses: { model: string; content: string }[],
  intention: string,
  messageType: MessageType
): string {
  const formattedResponses = responses
    .map((r, i) => `--- Oracle ${i + 1} (${r.model}) ---\n${r.content}`)
    .join('\n\n')

  return `Analyze thematic coherence across ${responses.length} oracle responses from a consciousness exploration app.

## Context
- Message type: ${messageType}
- Seeker's intention: "${intention}"

## Responses to Analyze
${formattedResponses}

-----

## Your Task

Score each dimension of the coherence rubric (0-100):

### Dimension 1: Thematic Alignment (0-100)
Do responses share underlying themes related to the intention?
- 90-100: All 5 responses share clear common themes
- 75-89: 4+ responses share themes
- 60-74: 3+ responses share themes
- 40-59: Only 2 responses share themes
- 0-39: No shared themes

### Dimension 2: Complementary Perspectives (0-100)
Do responses offer enriching angles (not contradictions)?
- 90-100: All perspectives enrich without contradiction
- 75-89: Mostly enriching, minor tensions
- 60-74: Some contradictions but workable
- 40-59: Significant contradictions
- 0-39: Responses directly contradict each other

### Dimension 3: Intuitive Resonance (0-100)
Do responses evoke similar feelings/imagery despite different language?
- 90-100: Strong emotional/imagistic coherence
- 75-89: Similar emotional tone across most
- 60-74: Mixed emotional registers
- 40-59: Conflicting emotional tones
- 0-39: Completely disparate feelings

### Dimension 4: Contextual Relevance (0-100)
Do responses connect to the SPECIFIC intention and any names/personalization provided?
Count how many responses:
- Reference or reflect on the specific question/intention asked
- Acknowledge any names mentioned (seeker name, subject name)
- Address the specific relationship or situation described

Scoring (based on response count out of total):
- 90-100: All responses show clear connection to the specific intention/names
- 75-89: 4+ responses connect to the specific context
- 60-74: 3 responses connect to specific context
- 40-59: Only 1-2 responses connect to specific context
- 0-39: No responses reference the specific intention or names

### Dimension 5: Specificity (0-100)
Are responses specific vs generic fortune-cookie platitudes?
- 90-100: All responses use specific, unique imagery
- 75-89: Mostly specific with minor generic elements
- 60-74: Mix of specific and generic
- 40-59: Mostly generic platitudes
- 0-39: All fortune-cookie responses

## Outlier Criteria
An outlier is a response that diverges significantly from the group.
Severity:
- minor: Different angle but enriches the whole
- moderate: Somewhat divergent, could confuse synthesis
- major: Contradicts or is completely unrelated

## Generic Phrases to Flag
- "The universe has a plan"
- "Trust your inner wisdom"
- "Everything happens for a reason"
- Any vague truism that could apply to anyone

## Response Format
Respond with ONLY this JSON (no other text):
{
  "rubric": {
    "thematicAlignment": <0-100>,
    "complementaryPerspectives": <0-100>,
    "intuitiveResonance": <0-100>,
    "contextualRelevance": <0-100>,
    "specificity": <0-100>
  },
  "confidence": <0.0-1.0>,
  "themeOverlap": ["theme1", "theme2", "theme3"],
  "outliers": [
    {
      "model": "<model name>",
      "divergenceType": "<thematic|emotional|temporal|tone>",
      "severity": "<minor|moderate|major>",
      "description": "<brief explanation>"
    }
  ],
  "genericPhrases": ["phrase1", "phrase2"],
  "reasoning": "<2-3 sentence explanation>"
}`
}

export { MESSAGE_SOURCES }
