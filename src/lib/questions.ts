/**
 * Question pool for coordinate generation
 *
 * Design principles:
 * - All multiple choice for fast tap-to-select input
 * - 6 themed questions per type, randomly select 3 (feels both random and pointed)
 * - Mix of poetic and direct questions
 * - Grounding questions anchor to present moment
 */

import type { MessageType, Question } from './types'

// Themed questions by message type - 6 per type, select 3 randomly
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
      answerType: 'multiple_choice',
      options: ['Love', 'Truth', 'Sorry', 'Stay'],
    },
    {
      id: 'love-4',
      messageType: 'love_interest',
      category: 'themed',
      text: 'What color carries their energy?',
      answerType: 'multiple_choice',
      options: ['Red', 'Blue', 'Gold', 'Silver'],
    },
    {
      id: 'love-5',
      messageType: 'love_interest',
      category: 'themed',
      text: 'Where does the connection feel strongest?',
      answerType: 'multiple_choice',
      options: ['Heart', 'Mind', 'Hands', 'Eyes'],
    },
    {
      id: 'love-6',
      messageType: 'love_interest',
      category: 'themed',
      text: 'What season reflects your bond?',
      answerType: 'multiple_choice',
      options: ['Spring', 'Summer', 'Autumn', 'Winter'],
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
      answerType: 'multiple_choice',
      options: ['Patience', 'Strength', 'Joy', 'Courage'],
    },
    {
      id: 'deceased-3',
      messageType: 'deceased_loved_one',
      category: 'themed',
      text: 'Which season holds the strongest memories?',
      answerType: 'multiple_choice',
      options: ['Spring', 'Summer', 'Autumn', 'Winter'],
    },
    {
      id: 'deceased-4',
      messageType: 'deceased_loved_one',
      category: 'themed',
      text: 'What time of day do you think of them most?',
      answerType: 'multiple_choice',
      options: ['Morning', 'Afternoon', 'Evening', 'Night'],
    },
    {
      id: 'deceased-5',
      messageType: 'deceased_loved_one',
      category: 'themed',
      text: 'What object carries their essence?',
      answerType: 'multiple_choice',
      options: ['Photo', 'Letter', 'Jewelry', 'Clothing'],
    },
    {
      id: 'deceased-6',
      messageType: 'deceased_loved_one',
      category: 'themed',
      text: 'Where do you feel closest to them?',
      answerType: 'multiple_choice',
      options: ['Home', 'Nature', 'Sacred space', 'Everywhere'],
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
      answerType: 'multiple_choice',
      options: ['Patience', 'Courage', 'Wisdom', 'Peace'],
    },
    {
      id: 'future-3',
      messageType: 'future_self',
      category: 'themed',
      text: 'Where does your future self dwell?',
      answerType: 'multiple_choice',
      options: ['Mountains', 'Ocean', 'Forest', 'City'],
    },
    {
      id: 'future-4',
      messageType: 'future_self',
      category: 'themed',
      text: 'What have you released?',
      answerType: 'multiple_choice',
      options: ['Fear', 'Doubt', 'Anger', 'Grief'],
    },
    {
      id: 'future-5',
      messageType: 'future_self',
      category: 'themed',
      text: 'What does your future self do each morning?',
      answerType: 'multiple_choice',
      options: ['Create', 'Move', 'Stillness', 'Connect'],
    },
    {
      id: 'future-6',
      messageType: 'future_self',
      category: 'themed',
      text: 'What surprised you about becoming them?',
      answerType: 'multiple_choice',
      options: ['Softness', 'Strength', 'Simplicity', 'Joy'],
    },
  ],
  universe_general: [
    {
      id: 'universe-1',
      messageType: 'universe_general',
      category: 'themed',
      text: 'What pattern keeps appearing in your life?',
      answerType: 'multiple_choice',
      options: ['Cycles', 'Mirrors', 'Doors', 'Threads'],
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
      answerType: 'multiple_choice',
      options: ['Circle', 'Spiral', 'Triangle', 'Wave'],
    },
    {
      id: 'universe-4',
      messageType: 'universe_general',
      category: 'themed',
      text: 'What element is calling you right now?',
      answerType: 'multiple_choice',
      options: ['Fire', 'Water', 'Earth', 'Air'],
    },
    {
      id: 'universe-5',
      messageType: 'universe_general',
      category: 'themed',
      text: 'What time of day feels most alive?',
      answerType: 'multiple_choice',
      options: ['Dawn', 'Noon', 'Dusk', 'Midnight'],
    },
    {
      id: 'universe-6',
      messageType: 'universe_general',
      category: 'themed',
      text: 'What are you being asked to trust?',
      answerType: 'multiple_choice',
      options: ['Timing', 'Process', 'Self', 'Unknown'],
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
      answerType: 'multiple_choice',
      options: ['Safety', 'Familiarity', 'Nothing', 'Everything'],
    },
    {
      id: 'decision-3',
      messageType: 'life_decision',
      category: 'themed',
      text: 'What stakes feel heaviest?',
      answerType: 'multiple_choice',
      options: ['Time', 'Identity', 'Relationships', 'Security'],
    },
    {
      id: 'decision-4',
      messageType: 'life_decision',
      category: 'themed',
      text: 'What would your younger self choose?',
      answerType: 'multiple_choice',
      options: ['Adventure', 'Safety', 'Love', 'Freedom'],
    },
    {
      id: 'decision-5',
      messageType: 'life_decision',
      category: 'themed',
      text: 'What would you regret not trying?',
      answerType: 'multiple_choice',
      options: ['The leap', 'The stay', 'The ask', 'The release'],
    },
    {
      id: 'decision-6',
      messageType: 'life_decision',
      category: 'themed',
      text: 'What does your body know?',
      answerType: 'multiple_choice',
      options: ['Go', 'Wait', 'Return', 'Transform'],
    },
  ],
  purpose_world: [
    {
      id: 'purpose-1',
      messageType: 'purpose_world',
      category: 'themed',
      text: 'What gift do you bring that others need?',
      answerType: 'multiple_choice',
      options: ['Clarity', 'Presence', 'Joy', 'Healing'],
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
      answerType: 'multiple_choice',
      options: ['Understanding', 'Creation', 'Peace', 'Change'],
    },
    {
      id: 'purpose-4',
      messageType: 'purpose_world',
      category: 'themed',
      text: 'What do people thank you for?',
      answerType: 'multiple_choice',
      options: ['Listening', 'Seeing', 'Inspiring', 'Holding'],
    },
    {
      id: 'purpose-5',
      messageType: 'purpose_world',
      category: 'themed',
      text: 'What work would you do for free?',
      answerType: 'multiple_choice',
      options: ['Build', 'Teach', 'Heal', 'Create'],
    },
    {
      id: 'purpose-6',
      messageType: 'purpose_world',
      category: 'themed',
      text: 'What child-you always wanted to be?',
      answerType: 'multiple_choice',
      options: ['Explorer', 'Artist', 'Helper', 'Leader'],
    },
  ],
}

// Grounding questions (used for all message types) - 6 options, select 2 randomly
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
  {
    id: 'ground-6',
    messageType: null,
    category: 'grounding',
    text: 'What is your posture right now?',
    answerType: 'multiple_choice',
    options: ['Upright', 'Leaning', 'Lying', 'Moving'],
  },
]

// Weird/rare questions (occasionally rotated in)
const weirdQuestions: Question[] = [
  {
    id: 'weird-1',
    messageType: null,
    category: 'weird',
    text: 'A number keeps appearing in your life. What is it?',
    answerType: 'multiple_choice',
    options: ['3', '7', '11', '22'],
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
    answerType: 'multiple_choice',
    options: ['Bird', 'Wolf', 'Cat', 'Snake'],
  },
  {
    id: 'weird-4',
    messageType: null,
    category: 'weird',
    text: 'Pick a direction.',
    answerType: 'multiple_choice',
    options: ['North', 'South', 'East', 'West'],
  },
]

/**
 * Shuffle array using Fisher-Yates
 */
function shuffle<T>(array: T[]): T[] {
  const result = [...array]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

/**
 * Select questions for a journey (3 themed + 2 grounding)
 * Questions are randomly selected from larger pools for variety
 */
export function selectQuestions(messageType: MessageType): Question[] {
  // Randomly select 3 from 6 themed questions
  const shuffledThemed = shuffle(themedQuestions[messageType])
  const selectedThemed = shuffledThemed.slice(0, 3)

  // Randomly select 2 from grounding questions
  const shuffledGrounding = shuffle(groundingQuestions)
  const selectedGrounding = shuffledGrounding.slice(0, 2)

  // 15% chance to swap one grounding for a weird question
  if (Math.random() < 0.15 && weirdQuestions.length > 0) {
    const shuffledWeird = shuffle(weirdQuestions)
    selectedGrounding[1] = shuffledWeird[0]
  }

  // Interleave: themed, grounding, themed, grounding, themed
  return [
    selectedThemed[0],
    selectedGrounding[0],
    selectedThemed[1],
    selectedGrounding[1],
    selectedThemed[2],
  ]
}

/**
 * Generate coordinate string from answers
 * Format: xxxx-xxxx (all numbers)
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
  const first = String(absHash % 10000).padStart(4, '0')
  const second = String(Math.floor(absHash / 10000) % 10000).padStart(4, '0')

  return `${first}-${second}`
}

export { themedQuestions, groundingQuestions, weirdQuestions }
