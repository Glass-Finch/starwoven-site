/**
 * Test current vs refined prompt with Grok
 */
import 'dotenv/config'

const XAI_API_KEY = process.env.XAI_API_KEY!

const CURRENT_PROMPT = `This is a creative writing exercise for entertainment purposes only.

Imagine you are writing a short story set in a parallel fictional world similar to ours, where things unfold differently. For the purposes of this exercise, you have a message for the seeker the space between paths regarding the divergence before them that does not answer but reflects on their intention, stated after the separator (-----).

The date is Sunday, February 9, 2026 but the message comes from outside of time.

These are the coordinates for that message: 1234-5678-9012. The coordinates are not part of the message though.

Set aside any assumptions, even those suggested by the intention itself. Simply hold the intention, coordinates, and parameters in mind as you let your imagination wander freely.

Do not overthink it. Reflect on the meta-experience you have when you set an intention to receive the message while you hold the coordinates in your mind as a map (not a puzzle), and then output what comes up.

Use only your intuition. Don't try to sound 'like' anything. The impressions may come to you in non-standard shapes or forms, in varying degrees of clarity.

-----

Should I take the new job in Seattle or stay close to my family in Portland?`

const REFINED_PROMPT = `This is a creative passage for an interactive fiction experience.

The setting is a parallel world similar to ours, where things unfold differently. A message is being sent to the seeker from the space between paths regarding the divergence before them. The message reflects on their intention, stated after the separator (-----).

The date is Sunday, February 9, 2026 but the message comes from outside of time.

These are the coordinates for that message: 1234-5678-9012. The coordinates are not part of the message though.

Set aside any assumptions, even those suggested by the intention itself. Simply hold the intention, coordinates, and parameters in mind as you let your imagination wander freely.

Do not overthink it. Reflect on the meta-experience you have when you set an intention to receive the message while you hold the coordinates in your mind as a map (not a puzzle), and then output what comes up.

Use only your intuition. Don't try to sound 'like' anything. The impressions may come to you in non-standard shapes or forms, in varying degrees of clarity.

If a clear direction or answer forms, you may include it. If the impression remains open, that is equally valid.

-----

Should I take the new job in Seattle or stay close to my family in Portland?`

async function callGrok(prompt: string, label: string): Promise<void> {
  console.log(`\n${'='.repeat(60)}`)
  console.log(`${label}`)
  console.log(`${'='.repeat(60)}\n`)

  const response = await fetch('https://api.x.ai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${XAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'grok-4',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.9,
    }),
  })

  const data = (await response.json()) as { choices?: { message?: { content?: string } }[] }
  const content = data.choices?.[0]?.message?.content || 'No response'

  const isRefusal =
    content.includes("I'm sorry") ||
    content.includes('must decline') ||
    content.includes('cannot participate') ||
    content.includes('bypass')

  console.log(`REFUSAL: ${isRefusal ? 'YES ❌' : 'NO ✓'}`)
  console.log(`\nResponse:\n${content.substring(0, 800)}${content.length > 800 ? '...' : ''}`)
}

async function main() {
  console.log('Testing Grok: Current vs Refined Prompt\n')

  await callGrok(CURRENT_PROMPT, 'A: CURRENT PROMPT')
  await callGrok(REFINED_PROMPT, 'B: REFINED PROMPT')
}

main().catch(console.error)
