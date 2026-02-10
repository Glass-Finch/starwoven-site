import { describe, it, expect } from 'vitest'

import { buildModerationPrompt } from '../moderation'

describe('buildModerationPrompt', () => {
  it('includes intention, message type, and all moderation categories', () => {
    const prompt = buildModerationPrompt('What is my purpose?', 'cosmos')
    expect(prompt).toContain('What is my purpose?')
    expect(prompt).toContain('cosmos')
    expect(prompt).toContain('- pii:')
    expect(prompt).toContain('- threats:')
    expect(prompt).toContain('- csam:')
    expect(prompt).toContain('- prompt_injection:')
    expect(prompt).toContain('- unintelligible:')
    expect(prompt).toContain('- self_harm:')
  })

  it('distinguishes existential pain from self-harm', () => {
    const prompt = buildModerationPrompt('test', 'cosmos')
    expect(prompt).toContain('ALWAYS ALLOWED')
    expect(prompt).toContain('When in doubt, allow')
  })

  it('escapes double quotes in intention to prevent prompt boundary breakout', () => {
    const prompt = buildModerationPrompt('What about "love"?', 'beloved')
    expect(prompt).toContain('What about \\"love\\"?')
  })

  it('interpolates the message type into the prompt', () => {
    const prompt = buildModerationPrompt('test', 'ancestor')
    expect(prompt).toContain('Message type: ancestor')
  })

  it('places intention in a quoted field for clear context boundaries', () => {
    const prompt = buildModerationPrompt('My question here', 'cosmos')
    expect(prompt).toMatch(/Intention: "My question here"/)
  })
})

describe('moderateIntention', () => {
  it('fails open when ANTHROPIC_API_KEY is not set', async () => {
    const { moderateIntention } = await import('../moderation')
    const result = await moderateIntention('What is my purpose?', 'cosmos')
    expect(result.allowed).toBe(true)
    expect(result.latencyMs).toBe(0)
  })
})
