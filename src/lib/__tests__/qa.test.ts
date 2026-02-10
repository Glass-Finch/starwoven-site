import { describe, it, expect } from 'vitest'

import { cleanupResponse, calculateCoherenceScore } from '../qa'
import type { CoherenceRubric } from '../types'

describe('cleanupResponse', () => {
  it('removes markdown headers', () => {
    expect(cleanupResponse('## Title\nContent here')).toBe('Title\nContent here')
    expect(cleanupResponse('### Deep header\nText')).toBe('Deep header\nText')
  })

  it('removes bold markdown but preserves text', () => {
    expect(cleanupResponse('This is **important** text')).toBe('This is important text')
  })

  it('removes italic markdown but preserves text', () => {
    expect(cleanupResponse('This is *italic* text')).toBe('This is italic text')
    expect(cleanupResponse('This is _underline_ text')).toBe('This is underline text')
  })

  it('removes entertainment disclaimers', () => {
    const withDisclaimer =
      'This is a creative writing exercise for entertainment purposes only. The real content here.'
    expect(cleanupResponse(withDisclaimer)).toBe('The real content here.')
  })

  it('removes standalone "for entertainment purposes only"', () => {
    expect(cleanupResponse('Content here. For entertainment purposes only.')).toBe('Content here.')
  })

  it('removes "as an AI" disclaimers', () => {
    expect(cleanupResponse('As an AI language model, I cannot predict the future.')).toBe('')
    expect(cleanupResponse("I'm an AI and cannot provide real advice.")).toBe('')
  })

  it('normalizes excessive line breaks', () => {
    expect(cleanupResponse('Line 1\n\n\n\n\nLine 2')).toBe('Line 1\n\nLine 2')
  })

  it('normalizes excessive spaces', () => {
    expect(cleanupResponse('Too   many   spaces')).toBe('Too many spaces')
  })

  it('trims leading and trailing whitespace', () => {
    expect(cleanupResponse('  content  ')).toBe('content')
  })

  it('preserves normal content unchanged', () => {
    const content = 'A warm presence lingers near the threshold of your awareness.'
    expect(cleanupResponse(content)).toBe(content)
  })

  it('handles empty string', () => {
    expect(cleanupResponse('')).toBe('')
  })

  it('handles content about AI as a topic (not self-reference)', () => {
    const content = 'The question of artificial intelligence is one that echoes through time.'
    expect(cleanupResponse(content)).toBe(content)
  })
})

describe('calculateCoherenceScore', () => {
  it('calculates weighted average correctly', () => {
    const rubric: CoherenceRubric = {
      thematicAlignment: 80,
      complementaryPerspectives: 80,
      intuitiveResonance: 80,
      contextualRelevance: 80,
      specificity: 80,
    }
    expect(calculateCoherenceScore(rubric)).toBe(80)
  })

  it('applies correct weights (25%, 20%, 20%, 15%, 20%)', () => {
    const rubric: CoherenceRubric = {
      thematicAlignment: 100,
      complementaryPerspectives: 0,
      intuitiveResonance: 0,
      contextualRelevance: 0,
      specificity: 0,
    }
    expect(calculateCoherenceScore(rubric)).toBe(25)
  })

  it('handles all zeros', () => {
    const rubric: CoherenceRubric = {
      thematicAlignment: 0,
      complementaryPerspectives: 0,
      intuitiveResonance: 0,
      contextualRelevance: 0,
      specificity: 0,
    }
    expect(calculateCoherenceScore(rubric)).toBe(0)
  })

  it('handles all 100s', () => {
    const rubric: CoherenceRubric = {
      thematicAlignment: 100,
      complementaryPerspectives: 100,
      intuitiveResonance: 100,
      contextualRelevance: 100,
      specificity: 100,
    }
    expect(calculateCoherenceScore(rubric)).toBe(100)
  })

  it('rounds to nearest integer', () => {
    const rubric: CoherenceRubric = {
      thematicAlignment: 73,
      complementaryPerspectives: 81,
      intuitiveResonance: 65,
      contextualRelevance: 88,
      specificity: 72,
    }
    // 73*0.25 + 81*0.20 + 65*0.20 + 88*0.15 + 72*0.20
    // = 18.25 + 16.2 + 13.0 + 13.2 + 14.4 = 75.05
    expect(calculateCoherenceScore(rubric)).toBe(75)
  })
})
