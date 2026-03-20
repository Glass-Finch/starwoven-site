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

    case 'sage':
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
 * Build the combined analysis prompt for Claude Sonnet
 *
 * A single prompt that handles validation, editing, and coherence analysis
 * for all oracle responses in one pass. Replaces the previous separate
 * validation (per-response) and coherence (batch) prompts.
 */
export function buildAnalysisPrompt(
  responses: { model: string; content: string }[],
  intention: string,
  messageType: MessageType
): string {
  const formattedResponses = responses
    .map((r, i) => `--- Response ${i + 1} (${r.model}) ---\n${r.content}`)
    .join('\n\n')

  return `Analyze ${responses.length} oracle responses from a consciousness exploration app.

## Context
- Message type: ${messageType}
- Seeker's intention: "${intention}"

## Responses
${formattedResponses}

-----

For each response, do three things:

## 1. Validate

Mark as INVALID only if:
- It is a refusal or decline to engage with the prompt
- It is entirely off-topic or unrelated to the intention
- It is an error message or technical failure text

Mark as VALID if it engages with the prompt in any way (even if unusual, abstract, or includes minor disclaimers).

## 2. Edit (valid responses only)

Clean up each valid response:
- Remove all markdown formatting (headers like ## or ###, bold **, italic *, underscores _)
- Remove entertainment/creative exercise disclaimers
- Remove AI self-references ("As an AI...", "I'm an AI...", "as a language model...")
- Remove phrases like "for entertainment purposes only"
- Normalize excessive whitespace and line breaks
- Preserve the core content, imagery, and voice exactly
- Do NOT add content, rewrite meaning, or change the tone
- If no cleanup is needed, return the text as-is

For invalid responses, set editedContent to an empty string.

## 3. Coherence Analysis (across all valid responses)

Score each dimension (0-100):

**Thematic Alignment**: Do responses share underlying themes related to the intention?
- 90-100: All responses share clear common themes
- 75-89: 4+ responses share themes
- 60-74: 3+ responses share themes
- 40-59: Only 2 share themes
- 0-39: No shared themes

**Complementary Perspectives**: Do responses offer enriching angles (not contradictions)?
- 90-100: All perspectives enrich without contradiction
- 75-89: Mostly enriching, minor tensions
- 60-74: Some contradictions but workable
- 40-59: Significant contradictions
- 0-39: Direct contradictions

**Intuitive Resonance**: Similar feelings/imagery despite different language?
- 90-100: Strong emotional/imagistic coherence
- 75-89: Similar emotional tone across most
- 60-74: Mixed emotional registers
- 40-59: Conflicting emotional tones
- 0-39: Completely disparate

**Contextual Relevance**: Do responses connect to the SPECIFIC intention and any names/personalization?
- 90-100: All show clear connection
- 75-89: 4+ connect
- 60-74: 3 connect
- 40-59: Only 1-2 connect
- 0-39: None reference the specific intention

**Specificity**: Specific vs generic fortune-cookie platitudes?
- 90-100: All use specific, unique imagery
- 75-89: Mostly specific
- 60-74: Mix of specific and generic
- 40-59: Mostly generic
- 0-39: All fortune-cookie

## Outlier Criteria
An outlier diverges significantly from the group.
- minor: Different angle but enriches
- moderate: Somewhat divergent, could confuse synthesis
- major: Contradicts or completely unrelated

## Generic Phrases to Flag
Flag vague truisms that could apply to anyone:
- "The universe has a plan"
- "Trust your inner wisdom"
- "Everything happens for a reason"

## Response Format
Respond with ONLY this JSON (no other text):
{
  "responses": [
    {
      "index": 0,
      "isValid": true,
      "reason": "",
      "confidence": 0.95,
      "editedContent": "the cleaned up text"
    }
  ],
  "rubric": {
    "thematicAlignment": <0-100>,
    "complementaryPerspectives": <0-100>,
    "intuitiveResonance": <0-100>,
    "contextualRelevance": <0-100>,
    "specificity": <0-100>
  },
  "coherenceConfidence": <0.0-1.0>,
  "themeOverlap": ["theme1", "theme2"],
  "outliers": [
    {
      "model": "<model name>",
      "divergenceType": "<thematic|emotional|temporal|tone>",
      "severity": "<minor|moderate|major>",
      "description": "<brief explanation>"
    }
  ],
  "genericPhrases": ["phrase1"],
  "reasoning": "<2-3 sentence explanation>"
}`
}
