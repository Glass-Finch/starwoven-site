import { describe, it, expect } from 'vitest'

import { selectQuestions, generateCoordinateString } from '../questions'
import type { MessageType, Answer } from '../types'

describe('selectQuestions', () => {
  const messageTypes: MessageType[] = [
    'beloved',
    'ancestor',
    'sage',
    'cosmos',
    'crossroads',
    'calling',
  ]

  it.each(messageTypes)('returns 5 questions for %s message type', (messageType) => {
    const questions = selectQuestions(messageType)
    expect(questions).toHaveLength(5)
  })

  it.each(messageTypes)('returns questions with valid structure for %s', (messageType) => {
    const questions = selectQuestions(messageType)

    questions.forEach((q) => {
      expect(q).toHaveProperty('id')
      expect(q).toHaveProperty('text')
      expect(q).toHaveProperty('answerType')
      expect(q).toHaveProperty('category')

      // All questions should be multiple choice with options
      expect(q.answerType).toBe('multiple_choice')
      expect(q.options).toBeDefined()
      expect(q.options!.length).toBeGreaterThanOrEqual(2)
    })
  })

  it('returns different questions on subsequent calls (randomized)', () => {
    // Run multiple times to test randomization
    const results: string[][] = []
    for (let i = 0; i < 10; i++) {
      const questions = selectQuestions('cosmos')
      results.push(questions.map((q) => q.id))
    }

    // At least some runs should have different question sets
    const uniqueSets = new Set(results.map((r) => r.join(',')))
    expect(uniqueSets.size).toBeGreaterThan(1)
  })
})

describe('generateCoordinateString', () => {
  it('generates a coordinate string from answers', () => {
    const answers: Answer[] = [
      { questionId: 'q1', answer: 'Fire', timestamp: 1000 },
      { questionId: 'q2', answer: 'Yes', timestamp: 2000 },
      { questionId: 'q3', answer: 'Blue', timestamp: 3000 },
    ]

    const result = generateCoordinateString(answers)

    expect(typeof result).toBe('string')
    expect(result.length).toBeGreaterThan(0)
  })

  it('generates different coordinates for different answers', () => {
    const answers1: Answer[] = [
      { questionId: 'q1', answer: 'Fire', timestamp: 1000 },
      { questionId: 'q2', answer: 'Yes', timestamp: 2000 },
    ]

    const answers2: Answer[] = [
      { questionId: 'q1', answer: 'Water', timestamp: 1000 },
      { questionId: 'q2', answer: 'No', timestamp: 2000 },
    ]

    const coord1 = generateCoordinateString(answers1)
    const coord2 = generateCoordinateString(answers2)

    expect(coord1).not.toBe(coord2)
  })

  it('handles empty answers array', () => {
    const result = generateCoordinateString([])
    expect(typeof result).toBe('string')
  })
})
