import { describe, it, expect } from 'vitest'

import {
  selectQuestions,
  generateCoordinateString,
  generateAnswerSegments,
  generateSingleSegment,
  enrichQuestionsWithMappings,
  themedQuestions,
  groundingQuestions,
  weirdQuestions,
} from '../questions'
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

  const mockQuestionsWithValues: Question[] = [
    {
      id: 'q1',
      messageType: null,
      category: 'themed',
      text: 'Which element?',
      answerType: 'multiple_choice',
      options: ['Fire', 'Water', 'Earth', 'Air'],
      values: [37, 22, 64, 11],
    },
    {
      id: 'q2',
      messageType: null,
      category: 'themed',
      text: 'What color?',
      answerType: 'multiple_choice',
      options: ['Red', 'Blue', 'Gold', 'Green'],
      values: [91, 44, 78, 33],
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
    // Water is 2nd option (index 1) → "02", Red is 1st (index 0) → "01", Excited is 4th (index 3) → "04"
    expect(segments).toEqual(['02', '01', '04'])
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
    expect(segments[0]).toBe('01')
  })

  it('handles empty answers array', () => {
    const segments = generateAnswerSegments([], mockQuestions)
    expect(segments).toHaveLength(0)
  })

  it('falls back to 1-indexed position when no values defined', () => {
    const answers = [
      { questionId: 'q1', answer: 'Fire' }, // index 0 → "1"
      { questionId: 'q1', answer: 'Water' }, // index 1 → "2"
      { questionId: 'q1', answer: 'Earth' }, // index 2 → "3"
      { questionId: 'q1', answer: 'Air' }, // index 3 → "4"
    ]

    const segments = generateAnswerSegments(answers, mockQuestions)

    expect(segments).toEqual(['01', '02', '03', '04'])
  })

  it('uses thematic values when defined on questions', () => {
    const answers = [
      { questionId: 'q1', answer: 'Fire' }, // values[0] → 37
      { questionId: 'q2', answer: 'Gold' }, // values[2] → 78
    ]

    const segments = generateAnswerSegments(answers, mockQuestionsWithValues)

    expect(segments).toEqual(['37', '78'])
  })

  it('is deterministic with thematic values', () => {
    const answers = [
      { questionId: 'q1', answer: 'Water' },
      { questionId: 'q2', answer: 'Blue' },
    ]

    const seg1 = generateAnswerSegments(answers, mockQuestionsWithValues)
    const seg2 = generateAnswerSegments(answers, mockQuestionsWithValues)

    expect(seg1).toEqual(seg2)
    expect(seg1).toEqual(['22', '44'])
  })
})

describe('generateAnswerSegments zero-padding', () => {
  it('pads single-digit values to two characters', () => {
    const questions: Question[] = [
      {
        id: 'q1',
        messageType: null,
        category: 'themed',
        text: 'Test?',
        answerType: 'multiple_choice',
        options: ['A', 'B'],
        values: [3, 7],
      },
    ]
    const answers = [{ questionId: 'q1', answer: 'A' }]
    const segments = generateAnswerSegments(answers, questions)
    expect(segments).toEqual(['03'])
  })
})

describe('enrichQuestionsWithMappings', () => {
  it('merges values and meanings from mappings onto questions', () => {
    const questions: Question[] = [
      {
        id: 'cosmic-moon',
        messageType: null,
        category: 'themed',
        text: 'What moon?',
        answerType: 'multiple_choice',
        options: ['New', 'Full'],
      },
    ]

    const mappings = new Map([
      [
        'cosmic-moon',
        {
          values: [24, 14],
          meanings: ['Return (Hexagram 24)', 'Great Possession (Hexagram 14)'],
          source: 'I Ching',
        },
      ],
    ])

    const enriched = enrichQuestionsWithMappings(questions, mappings)

    expect(enriched[0].values).toEqual([24, 14])
    expect(enriched[0].meanings).toEqual([
      'I Ching — Return (Hexagram 24)',
      'I Ching — Great Possession (Hexagram 14)',
    ])
  })

  it('skips mapping when values length does not match options length', () => {
    const questions: Question[] = [
      {
        id: 'mismatched',
        messageType: null,
        category: 'themed',
        text: 'Mismatch?',
        answerType: 'multiple_choice',
        options: ['A', 'B', 'C', 'D'],
      },
    ]

    const mappings = new Map([
      [
        'mismatched',
        {
          values: [10, 20, 30], // 3 values vs 4 options
          meanings: ['X', 'Y', 'Z'],
          source: 'Test',
        },
      ],
    ])

    const enriched = enrichQuestionsWithMappings(questions, mappings)

    // Should skip the mapping due to length mismatch
    expect(enriched[0].values).toBeUndefined()
    expect(enriched[0].meanings).toBeUndefined()
  })

  it('returns original question when no mapping exists', () => {
    const questions: Question[] = [
      {
        id: 'unmapped',
        messageType: null,
        category: 'themed',
        text: 'No mapping?',
        answerType: 'multiple_choice',
        options: ['A', 'B'],
      },
    ]

    const enriched = enrichQuestionsWithMappings(questions, new Map())

    expect(enriched[0].values).toBeUndefined()
    expect(enriched[0].meanings).toBeUndefined()
  })
})

describe('generateCoordinateString with questions', () => {
  const mockQuestions: Question[] = [
    {
      id: 'q1',
      messageType: null,
      category: 'themed',
      text: 'Which element?',
      answerType: 'multiple_choice',
      options: ['Fire', 'Water', 'Earth', 'Air'],
      values: [37, 22, 64, 11],
    },
    {
      id: 'q2',
      messageType: null,
      category: 'themed',
      text: 'What season?',
      answerType: 'multiple_choice',
      options: ['Spring', 'Summer', 'Autumn', 'Winter'],
      values: [15, 42, 73, 88],
    },
  ]

  it('produces xx-xx format when questions have thematic values', () => {
    const answers = [
      { questionId: 'q1', answer: 'Fire', timestamp: 1000 },
      { questionId: 'q2', answer: 'Winter', timestamp: 2000 },
    ]

    const result = generateCoordinateString(answers, mockQuestions)

    expect(result).toBe('37-88')
  })

  it('falls back to hash format when no questions provided', () => {
    const answers = [
      { questionId: 'q1', answer: 'Fire', timestamp: 1000 },
      { questionId: 'q2', answer: 'Yes', timestamp: 2000 },
    ]

    const result = generateCoordinateString(answers)

    expect(result).toMatch(/^\d{4}-\d{4}$/)
  })

  it('is deterministic with thematic values', () => {
    const answers = [
      { questionId: 'q1', answer: 'Earth', timestamp: 1000 },
      { questionId: 'q2', answer: 'Summer', timestamp: 2000 },
    ]

    const r1 = generateCoordinateString(answers, mockQuestions)
    const r2 = generateCoordinateString(answers, mockQuestions)

    expect(r1).toBe(r2)
    expect(r1).toBe('64-42')
  })

  it('falls back to "01" for answers referencing non-existent question IDs', () => {
    const answers = [
      { questionId: 'nonexistent', answer: 'Whatever', timestamp: 1000 },
      { questionId: 'q1', answer: 'Fire', timestamp: 2000 },
    ]

    const result = generateCoordinateString(answers, mockQuestions)

    // nonexistent → question undefined → falls back to "01"; Fire → values[0] = 37
    expect(result).toBe('01-37')
  })
})

describe('generateSingleSegment', () => {
  it('returns thematic value when question has values', () => {
    const question: Question = {
      id: 'q1',
      messageType: null,
      category: 'themed',
      text: 'Test?',
      answerType: 'multiple_choice',
      options: ['A', 'B', 'C'],
      values: [11, 22, 33],
    }
    expect(generateSingleSegment(question, 'B')).toBe('22')
  })

  it('falls back to 1-indexed position without values', () => {
    const question: Question = {
      id: 'q1',
      messageType: null,
      category: 'themed',
      text: 'Test?',
      answerType: 'multiple_choice',
      options: ['A', 'B', 'C'],
    }
    expect(generateSingleSegment(question, 'C')).toBe('03')
  })

  it('returns "01" for undefined question', () => {
    expect(generateSingleSegment(undefined, 'anything')).toBe('01')
  })
})

describe('question pool integrity', () => {
  const allMessageTypes: MessageType[] = [
    'beloved',
    'ancestor',
    'sage',
    'cosmos',
    'crossroads',
    'calling',
  ]

  it('no duplicate IDs within any single question pool', () => {
    const pools: { name: string; questions: Question[] }[] = [
      ...allMessageTypes.map((type) => ({
        name: `themed:${type}`,
        questions: themedQuestions[type],
      })),
      { name: 'grounding', questions: groundingQuestions },
      { name: 'weird', questions: weirdQuestions },
    ]

    for (const pool of pools) {
      const ids = pool.questions.map((q) => q.id)
      const duplicates = ids.filter((id, i) => ids.indexOf(id) !== i)
      expect(duplicates, `duplicates in ${pool.name}`).toEqual([])
    }
  })

  it('all questions have 4 options (matching coordinate mapping arrays)', () => {
    const allQuestions = [
      ...Object.values(themedQuestions).flat(),
      ...groundingQuestions,
      ...weirdQuestions,
    ]

    for (const q of allQuestions) {
      expect(q.options).toBeDefined()
      expect(q.options!.length).toBe(4)
    }
  })

  it.each(allMessageTypes)('themed pool for %s has at least 15 questions', (messageType) => {
    expect(themedQuestions[messageType].length).toBeGreaterThanOrEqual(15)
  })

  it('grounding pool has at least 12 questions', () => {
    expect(groundingQuestions.length).toBeGreaterThanOrEqual(12)
  })

  it('weird pool has at least 6 questions', () => {
    expect(weirdQuestions.length).toBeGreaterThanOrEqual(6)
  })
})
