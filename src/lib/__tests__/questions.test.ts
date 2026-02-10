import { describe, it, expect } from 'vitest'

import { selectQuestions, generateCoordinateString, generateAnswerSegments } from '../questions'
import type { MessageType, Answer, Question } from '../types'

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

  it('is deterministic — same answers always produce the same coordinate', () => {
    const answers: Answer[] = [
      { questionId: 'q1', answer: 'Fire', timestamp: 1000 },
      { questionId: 'q2', answer: 'Yes', timestamp: 2000 },
      { questionId: 'q3', answer: 'Blue', timestamp: 3000 },
    ]

    const coord1 = generateCoordinateString(answers)
    const coord2 = generateCoordinateString(answers)
    const coord3 = generateCoordinateString(answers)

    expect(coord1).toBe(coord2)
    expect(coord2).toBe(coord3)
  })

  it('produces xxxx-xxxx format', () => {
    const answers: Answer[] = [
      { questionId: 'q1', answer: 'Fire', timestamp: 1000 },
      { questionId: 'q2', answer: 'Yes', timestamp: 2000 },
    ]

    const result = generateCoordinateString(answers)
    expect(result).toMatch(/^\d{4}-\d{4}$/)
  })
})

describe('generateAnswerSegments', () => {
  const mockQuestions: Question[] = [
    {
      id: 'q1',
      messageType: null,
      category: 'themed',
      text: 'Which element?',
      answerType: 'multiple_choice',
      options: ['Fire', 'Water', 'Earth', 'Air'],
    },
    {
      id: 'q2',
      messageType: null,
      category: 'themed',
      text: 'What color?',
      answerType: 'multiple_choice',
      options: ['Red', 'Blue', 'Gold', 'Green'],
    },
    {
      id: 'q3',
      messageType: null,
      category: 'grounding',
      text: 'What feeling?',
      answerType: 'multiple_choice',
      options: ['Calm', 'Curious', 'Anxious', 'Excited'],
    },
  ]

  it('produces one numeric segment per answer', () => {
    const answers = [
      { questionId: 'q1', answer: 'Water' },
      { questionId: 'q2', answer: 'Red' },
      { questionId: 'q3', answer: 'Excited' },
    ]

    const segments = generateAnswerSegments(answers, mockQuestions)

    expect(segments).toHaveLength(3)
    // Water is 2nd option (index 1) → "2", Red is 1st (index 0) → "1", Excited is 4th (index 3) → "4"
    expect(segments).toEqual(['2', '1', '4'])
  })

  it('returns purely numeric strings with no letters', () => {
    const answers = [
      { questionId: 'q1', answer: 'Air' },
      { questionId: 'q2', answer: 'Gold' },
    ]

    const segments = generateAnswerSegments(answers, mockQuestions)

    segments.forEach((segment) => {
      expect(segment).toMatch(/^\d+$/)
    })
  })

  it('handles missing question gracefully (defaults to 1)', () => {
    const answers = [{ questionId: 'nonexistent', answer: 'Something' }]

    const segments = generateAnswerSegments(answers, mockQuestions)

    expect(segments).toHaveLength(1)
    expect(segments[0]).toBe('1')
  })

  it('handles empty answers array', () => {
    const segments = generateAnswerSegments([], mockQuestions)
    expect(segments).toHaveLength(0)
  })

  it('maps option positions correctly (1-indexed)', () => {
    const answers = [
      { questionId: 'q1', answer: 'Fire' }, // index 0 → "1"
      { questionId: 'q1', answer: 'Water' }, // index 1 → "2"
      { questionId: 'q1', answer: 'Earth' }, // index 2 → "3"
      { questionId: 'q1', answer: 'Air' }, // index 3 → "4"
    ]

    const segments = generateAnswerSegments(answers, mockQuestions)

    expect(segments).toEqual(['1', '2', '3', '4'])
  })
})
