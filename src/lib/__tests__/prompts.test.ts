import { describe, it, expect } from 'vitest'

import { buildChannelingPrompt, buildSynthesisPrompt, buildAnalysisPrompt } from '../prompts'
import type { MessageType, CoordinateSet, PersonalizationInputs } from '../types'

const mockCoordinates: CoordinateSet = {
  raw: '4821-7293-1547-6038',
  questions: [],
  answers: [],
}

describe('buildChannelingPrompt', () => {
  it('includes the intention text', () => {
    const prompt = buildChannelingPrompt('cosmos', mockCoordinates, 'What do I need to hear?')
    expect(prompt).toContain('What do I need to hear?')
  })

  it('includes the coordinate string', () => {
    const prompt = buildChannelingPrompt('cosmos', mockCoordinates, 'test intention')
    expect(prompt).toContain('4821-7293-1547-6038')
  })

  it('includes creative exercise framing', () => {
    const prompt = buildChannelingPrompt('cosmos', mockCoordinates, 'test')
    expect(prompt).toContain('creative passage')
    expect(prompt).toContain('interactive fiction')
  })

  it('includes personalization for beloved type', () => {
    const personalization: PersonalizationInputs = {
      type: 'beloved',
      data: { yourName: 'Alex', theirName: 'Jordan' },
    }
    const prompt = buildChannelingPrompt(
      'beloved',
      mockCoordinates,
      'Do they care?',
      personalization
    )
    expect(prompt).toContain('Alex')
    expect(prompt).toContain('Jordan')
  })

  it('includes personalization for ancestor type', () => {
    const personalization: PersonalizationInputs = {
      type: 'ancestor',
      data: { yourName: 'Sam', theirName: 'Eleanor', relationship: 'grandmother' },
    }
    const prompt = buildChannelingPrompt(
      'ancestor',
      mockCoordinates,
      'Are you at peace?',
      personalization
    )
    expect(prompt).toContain('Sam')
    expect(prompt).toContain('Eleanor')
    expect(prompt).toContain('grandmother')
    expect(prompt).toContain('crossed over')
  })

  it('includes age for sage type', () => {
    const personalization: PersonalizationInputs = {
      type: 'sage',
      data: { yourName: 'Pat', birthday: '1990-06-15' },
    }
    const prompt = buildChannelingPrompt(
      'sage',
      mockCoordinates,
      'What should I focus on?',
      personalization
    )
    expect(prompt).toContain('Pat')
    expect(prompt).toContain('born on')
  })

  it('works without personalization', () => {
    const prompt = buildChannelingPrompt('cosmos', mockCoordinates, 'What do I need?')
    expect(prompt).not.toContain('Context for this reading')
  })

  it('does not contain exclamation points', () => {
    const allTypes: MessageType[] = [
      'beloved',
      'ancestor',
      'sage',
      'cosmos',
      'crossroads',
      'calling',
    ]
    for (const type of allTypes) {
      const prompt = buildChannelingPrompt(type, mockCoordinates, 'test')
      expect(prompt).not.toContain('!')
    }
  })
})

describe('buildSynthesisPrompt', () => {
  const mockResponses = [
    { model: 'gpt-4.1', content: 'First impression content' },
    { model: 'claude-sonnet-4.5', content: 'Second impression content' },
    { model: 'gemini-3-pro-preview', content: 'Third impression content' },
  ]

  it('includes the intention', () => {
    const prompt = buildSynthesisPrompt('cosmos', 'What do I need?', mockResponses)
    expect(prompt).toContain('What do I need?')
  })

  it('includes all response content', () => {
    const prompt = buildSynthesisPrompt('cosmos', 'test', mockResponses)
    expect(prompt).toContain('First impression content')
    expect(prompt).toContain('Second impression content')
    expect(prompt).toContain('Third impression content')
  })

  it('does not include model names in impressions', () => {
    const prompt = buildSynthesisPrompt('cosmos', 'test', mockResponses)
    // Impressions are numbered, not attributed to models
    expect(prompt).toContain('--- 1 ---')
    expect(prompt).toContain('--- 2 ---')
    expect(prompt).not.toContain('gpt-4.1')
  })

  it('includes seeker name when personalization provided', () => {
    const personalization: PersonalizationInputs = {
      type: 'beloved',
      data: { yourName: 'Taylor', theirName: 'Chris' },
    }
    const prompt = buildSynthesisPrompt('beloved', 'test', mockResponses, personalization)
    expect(prompt).toContain('Taylor')
  })

  it('includes message source framing', () => {
    const prompt = buildSynthesisPrompt('ancestor', 'test', mockResponses)
    expect(prompt).toContain('beyond the veil')
  })
})

describe('buildAnalysisPrompt', () => {
  const mockResponses = [
    { model: 'gpt-4.1', content: 'Response one' },
    { model: 'claude-sonnet-4.5', content: 'Response two' },
    { model: 'gemini-3-pro-preview', content: 'Response three' },
  ]

  it('includes all responses', () => {
    const prompt = buildAnalysisPrompt(mockResponses, 'test intention', 'cosmos')
    expect(prompt).toContain('Response one')
    expect(prompt).toContain('Response two')
    expect(prompt).toContain('Response three')
  })

  it('includes the rubric dimensions', () => {
    const prompt = buildAnalysisPrompt(mockResponses, 'test', 'cosmos')
    expect(prompt).toContain('Thematic Alignment')
    expect(prompt).toContain('Complementary Perspectives')
    expect(prompt).toContain('Intuitive Resonance')
    expect(prompt).toContain('Contextual Relevance')
    expect(prompt).toContain('Specificity')
  })

  it('requests JSON output', () => {
    const prompt = buildAnalysisPrompt(mockResponses, 'test', 'cosmos')
    expect(prompt).toContain('JSON')
  })

  it('includes the response count', () => {
    const prompt = buildAnalysisPrompt(mockResponses, 'test', 'cosmos')
    expect(prompt).toContain('3 oracle responses')
  })

  it('includes validation instructions', () => {
    const prompt = buildAnalysisPrompt(mockResponses, 'test', 'cosmos')
    expect(prompt).toContain('INVALID')
    expect(prompt).toContain('VALID')
    expect(prompt).toContain('refusal')
  })

  it('includes editing instructions', () => {
    const prompt = buildAnalysisPrompt(mockResponses, 'test', 'cosmos')
    expect(prompt).toContain('editedContent')
    expect(prompt).toContain('markdown')
    expect(prompt).toContain('disclaimers')
  })

  it('includes coherence analysis in the same prompt', () => {
    const prompt = buildAnalysisPrompt(mockResponses, 'test', 'cosmos')
    // All three concerns in one prompt
    expect(prompt).toContain('Validate')
    expect(prompt).toContain('Edit')
    expect(prompt).toContain('Coherence')
  })

  it('includes the intention and message type', () => {
    const prompt = buildAnalysisPrompt(mockResponses, 'What is my purpose?', 'calling')
    expect(prompt).toContain('What is my purpose?')
    expect(prompt).toContain('calling')
  })
})
