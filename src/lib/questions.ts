/**
 * Question pool for coordinate generation
 */

import type { MessageType, Question } from './types'

// Themed questions by message type
const themedQuestions: Record<MessageType, Question[]> = {
  love_interest: [
    {
      id: 'love-1',
      messageType: 'love_interest',
      category: 'themed',
      text: 'Which element speaks to the energy between you?',
      answerType: 'multiple_choice',
      options: ['Fire', 'Water', 'Earth', 'Air'],
    },
    {
      id: 'love-2',
      messageType: 'love_interest',
      category: 'themed',
      text: 'What time of day do you feel them most present?',
      answerType: 'multiple_choice',
      options: ['Dawn', 'Midday', 'Dusk', 'Midnight'],
    },
    {
      id: 'love-3',
      messageType: 'love_interest',
      category: 'themed',
      text: 'What word lives unspoken between you?',
      answerType: 'short_text',
    },
  ],
  deceased_loved_one: [
    {
      id: 'deceased-1',
      messageType: 'deceased_loved_one',
      category: 'themed',
      text: 'In what form do you sense their presence?',
      answerType: 'multiple_choice',
      options: ['Dreams', 'Signs', 'Feelings', 'Memories'],
    },
    {
      id: 'deceased-2',
      messageType: 'deceased_loved_one',
      category: 'themed',
      text: 'What did they teach you without words?',
      answerType: 'short_text',
    },
    {
      id: 'deceased-3',
      messageType: 'deceased_loved_one',
      category: 'themed',
      text: 'Which season holds the strongest memories?',
      answerType: 'multiple_choice',
      options: ['Spring', 'Summer', 'Autumn', 'Winter'],
    },
  ],
  future_self: [
    {
      id: 'future-1',
      messageType: 'future_self',
      category: 'themed',
      text: 'How far ahead does your future self reside?',
      answerType: 'multiple_choice',
      options: ['1 year', '5 years', '10 years', 'Beyond time'],
    },
    {
      id: 'future-2',
      messageType: 'future_self',
      category: 'themed',
      text: 'What quality have you cultivated?',
      answerType: 'short_text',
    },
    {
      id: 'future-3',
      messageType: 'future_self',
      category: 'themed',
      text: 'Where does your future self dwell?',
      answerType: 'multiple_choice',
      options: ['Mountains', 'Ocean', 'Forest', 'City'],
    },
  ],
  universe_general: [
    {
      id: 'universe-1',
      messageType: 'universe_general',
      category: 'themed',
      text: 'What pattern keeps appearing in your life?',
      answerType: 'short_text',
    },
    {
      id: 'universe-2',
      messageType: 'universe_general',
      category: 'themed',
      text: 'Which celestial body calls to you?',
      answerType: 'multiple_choice',
      options: ['Sun', 'Moon', 'Stars', 'Void'],
    },
    {
      id: 'universe-3',
      messageType: 'universe_general',
      category: 'themed',
      text: 'What symbol appears when you close your eyes?',
      answerType: 'short_text',
    },
  ],
  life_decision: [
    {
      id: 'decision-1',
      messageType: 'life_decision',
      category: 'themed',
      text: 'How many paths do you see before you?',
      answerType: 'multiple_choice',
      options: ['Two', 'Three', 'Many', 'None are clear'],
    },
    {
      id: 'decision-2',
      messageType: 'life_decision',
      category: 'themed',
      text: 'What does fear want you to choose?',
      answerType: 'short_text',
    },
    {
      id: 'decision-3',
      messageType: 'life_decision',
      category: 'themed',
      text: 'What stakes feel heaviest?',
      answerType: 'multiple_choice',
      options: ['Time', 'Identity', 'Relationships', 'Security'],
    },
  ],
  purpose_world: [
    {
      id: 'purpose-1',
      messageType: 'purpose_world',
      category: 'themed',
      text: 'What gift do you bring that others need?',
      answerType: 'short_text',
    },
    {
      id: 'purpose-2',
      messageType: 'purpose_world',
      category: 'themed',
      text: 'When do you feel most alive?',
      answerType: 'multiple_choice',
      options: ['Creating', 'Connecting', 'Teaching', 'Healing'],
    },
    {
      id: 'purpose-3',
      messageType: 'purpose_world',
      category: 'themed',
      text: 'What impact do you wish to leave?',
      answerType: 'short_text',
    },
  ],
}

// Grounding questions (used for all message types)
const groundingQuestions: Question[] = [
  {
    id: 'ground-1',
    messageType: null,
    category: 'grounding',
    text: 'How many windows can you see right now?',
    answerType: 'multiple_choice',
    options: ['None', '1-2', '3-5', 'More than 5'],
  },
  {
    id: 'ground-2',
    messageType: null,
    category: 'grounding',
    text: 'What color dominates your current space?',
    answerType: 'multiple_choice',
    options: ['Light', 'Dark', 'Warm', 'Cool'],
  },
  {
    id: 'ground-3',
    messageType: null,
    category: 'grounding',
    text: 'Count your breaths for 10 seconds. How many?',
    answerType: 'multiple_choice',
    options: ['1-2', '3-4', '5-6', 'More'],
  },
  {
    id: 'ground-4',
    messageType: null,
    category: 'grounding',
    text: 'What sound is closest to you right now?',
    answerType: 'multiple_choice',
    options: ['Silence', 'Nature', 'Machine', 'Voice'],
  },
  {
    id: 'ground-5',
    messageType: null,
    category: 'grounding',
    text: 'What texture are you touching?',
    answerType: 'multiple_choice',
    options: ['Soft', 'Smooth', 'Rough', 'Cool'],
  },
]

// Weird/rare questions (occasionally rotated in)
const weirdQuestions: Question[] = [
  {
    id: 'weird-1',
    messageType: null,
    category: 'weird',
    text: 'A number keeps appearing in your life. What is it?',
    answerType: 'short_text',
  },
  {
    id: 'weird-2',
    messageType: null,
    category: 'weird',
    text: 'If your current mood were weather, what would it be?',
    answerType: 'multiple_choice',
    options: ['Clear sky', 'Gentle rain', 'Storm', 'Fog'],
  },
  {
    id: 'weird-3',
    messageType: null,
    category: 'weird',
    text: 'What animal has appeared in your thoughts lately?',
    answerType: 'short_text',
  },
]

/**
 * Select questions for a journey (3 themed + 2 grounding)
 */
export function selectQuestions(messageType: MessageType): Question[] {
  const themed = themedQuestions[messageType]

  // Shuffle grounding questions and pick 2
  const shuffledGrounding = [...groundingQuestions].sort(() => Math.random() - 0.5)
  const selectedGrounding = shuffledGrounding.slice(0, 2)

  // 10% chance to swap one grounding for a weird question
  if (Math.random() < 0.1 && weirdQuestions.length > 0) {
    const weirdIndex = Math.floor(Math.random() * weirdQuestions.length)
    selectedGrounding[1] = weirdQuestions[weirdIndex]
  }

  // Interleave: themed, grounding, themed, grounding, themed
  return [
    themed[0],
    selectedGrounding[0],
    themed[1],
    selectedGrounding[1],
    themed[2],
  ]
}

/**
 * Generate coordinate string from answers
 */
export function generateCoordinateString(answers: { questionId: string; answer: string }[]): string {
  // Create deterministic but pseudo-random coordinates based on answers
  let hash = 0
  const answerStr = answers.map(a => `${a.questionId}:${a.answer}`).join('|')

  for (let i = 0; i < answerStr.length; i++) {
    const char = answerStr.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }

  const absHash = Math.abs(hash)
  const t = String(absHash % 1000).padStart(3, '0')
  const e = String(Math.floor(absHash / 1000) % 1000).padStart(3, '0')
  const i = String(Math.floor(absHash / 1000000) % 1000).padStart(3, '0')

  return `T-${t}-E-${e}-I-${i}`
}

export { themedQuestions, groundingQuestions, weirdQuestions }
