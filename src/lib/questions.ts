/**
 * Question pool for coordinate generation
 *
 * Design principles:
 * - All multiple choice for fast tap-to-select input
 * - 15-20 themed questions per type, randomly select 3 (random + pointed)
 * - Mix of poetic and direct questions
 * - Categories: cosmic, sensory, emotional, color, symbolic
 * - Grounding questions anchor to present moment
 */

import type { MessageType, Question } from './types'

// ============================================
// UNIVERSAL QUESTION POOLS (shared across types)
// ============================================

const cosmicQuestions: Question[] = [
  {
    id: 'cosmic-moon',
    messageType: null,
    category: 'themed',
    text: 'What moon do you identify with right now?',
    answerType: 'multiple_choice',
    options: ['New', 'Waxing', 'Full', 'Waning'],
  },
  {
    id: 'cosmic-element',
    messageType: null,
    category: 'themed',
    text: 'Which element calls to you now?',
    answerType: 'multiple_choice',
    options: ['Fire', 'Water', 'Earth', 'Air'],
  },
  {
    id: 'cosmic-celestial',
    messageType: null,
    category: 'themed',
    text: 'Which celestial body draws you?',
    answerType: 'multiple_choice',
    options: ['Sun', 'Moon', 'Stars', 'Void'],
  },
  {
    id: 'cosmic-season-inner',
    messageType: null,
    category: 'themed',
    text: 'What season lives inside you right now?',
    answerType: 'multiple_choice',
    options: ['Spring', 'Summer', 'Autumn', 'Winter'],
  },
  {
    id: 'cosmic-time',
    messageType: null,
    category: 'themed',
    text: 'What time of day resonates?',
    answerType: 'multiple_choice',
    options: ['Dawn', 'Noon', 'Dusk', 'Midnight'],
  },
]

const colorQuestions: Question[] = [
  {
    id: 'color-draw',
    messageType: null,
    category: 'themed',
    text: 'Which color draws you in?',
    answerType: 'multiple_choice',
    options: ['Red', 'Blue', 'Gold', 'Green'],
  },
  {
    id: 'color-warmth',
    messageType: null,
    category: 'themed',
    text: 'Warm or cool?',
    answerType: 'multiple_choice',
    options: ['Warm', 'Cool', 'Neutral', 'Both'],
  },
  {
    id: 'color-light',
    messageType: null,
    category: 'themed',
    text: 'Light or shadow?',
    answerType: 'multiple_choice',
    options: ['Bright', 'Dim', 'Shadow', 'Shifting'],
  },
  {
    id: 'color-mood',
    messageType: null,
    category: 'themed',
    text: 'What color is your mood?',
    answerType: 'multiple_choice',
    options: ['Silver', 'Rose', 'Indigo', 'Amber'],
  },
]

const symbolicQuestions: Question[] = [
  {
    id: 'symbol-shape',
    messageType: null,
    category: 'themed',
    text: 'What shape appears?',
    answerType: 'multiple_choice',
    options: ['Circle', 'Triangle', 'Spiral', 'Wave'],
  },
  {
    id: 'symbol-direction',
    messageType: null,
    category: 'themed',
    text: 'Which direction calls?',
    answerType: 'multiple_choice',
    options: ['North', 'South', 'East', 'West'],
  },
  {
    id: 'symbol-number',
    messageType: null,
    category: 'themed',
    text: 'A number surfaces. What is it?',
    answerType: 'multiple_choice',
    options: ['3', '7', '9', '12'],
  },
  {
    id: 'symbol-animal',
    messageType: null,
    category: 'themed',
    text: 'What creature appears?',
    answerType: 'multiple_choice',
    options: ['Bird', 'Wolf', 'Snake', 'Deer'],
  },
  {
    id: 'symbol-object',
    messageType: null,
    category: 'themed',
    text: 'An object appears. What is it?',
    answerType: 'multiple_choice',
    options: ['Key', 'Mirror', 'Flame', 'Stone'],
  },
]

const emotionalQuestions: Question[] = [
  {
    id: 'emotional-weather',
    messageType: null,
    category: 'themed',
    text: 'What is your inner weather?',
    answerType: 'multiple_choice',
    options: ['Calm', 'Stormy', 'Foggy', 'Shifting'],
  },
  {
    id: 'emotional-energy',
    messageType: null,
    category: 'themed',
    text: 'Where is your energy?',
    answerType: 'multiple_choice',
    options: ['Rising', 'Peak', 'Falling', 'Still'],
  },
  {
    id: 'emotional-body',
    messageType: null,
    category: 'themed',
    text: 'Where do you feel it in your body?',
    answerType: 'multiple_choice',
    options: ['Head', 'Heart', 'Gut', 'Everywhere'],
  },
  {
    id: 'emotional-need',
    messageType: null,
    category: 'themed',
    text: 'What do you need right now?',
    answerType: 'multiple_choice',
    options: ['Clarity', 'Peace', 'Courage', 'Release'],
  },
]

// ============================================
// TYPE-SPECIFIC QUESTIONS (15+ per type)
// ============================================

const loveInterestQuestions: Question[] = [
  {
    id: 'love-element',
    messageType: 'love_interest',
    category: 'themed',
    text: 'Which element speaks to the energy between you?',
    answerType: 'multiple_choice',
    options: ['Fire', 'Water', 'Earth', 'Air'],
  },
  {
    id: 'love-time',
    messageType: 'love_interest',
    category: 'themed',
    text: 'What time of day do you feel them most?',
    answerType: 'multiple_choice',
    options: ['Dawn', 'Midday', 'Dusk', 'Midnight'],
  },
  {
    id: 'love-word',
    messageType: 'love_interest',
    category: 'themed',
    text: 'What word lives unspoken between you?',
    answerType: 'multiple_choice',
    options: ['Love', 'Truth', 'Sorry', 'Stay'],
  },
  {
    id: 'love-color',
    messageType: 'love_interest',
    category: 'themed',
    text: 'What color carries their energy?',
    answerType: 'multiple_choice',
    options: ['Red', 'Blue', 'Gold', 'Silver'],
  },
  {
    id: 'love-body',
    messageType: 'love_interest',
    category: 'themed',
    text: 'Where does the connection feel strongest?',
    answerType: 'multiple_choice',
    options: ['Heart', 'Mind', 'Hands', 'Eyes'],
  },
  {
    id: 'love-season',
    messageType: 'love_interest',
    category: 'themed',
    text: 'What season reflects your bond?',
    answerType: 'multiple_choice',
    options: ['Spring', 'Summer', 'Autumn', 'Winter'],
  },
  {
    id: 'love-distance',
    messageType: 'love_interest',
    category: 'themed',
    text: 'How close do they feel right now?',
    answerType: 'multiple_choice',
    options: ['Near', 'Far', 'Within', 'Shifting'],
  },
  {
    id: 'love-sound',
    messageType: 'love_interest',
    category: 'themed',
    text: 'What sound represents them?',
    answerType: 'multiple_choice',
    options: ['Music', 'Silence', 'Laughter', 'Whisper'],
  },
  {
    id: 'love-weather',
    messageType: 'love_interest',
    category: 'themed',
    text: 'What weather is this love?',
    answerType: 'multiple_choice',
    options: ['Sunshine', 'Rain', 'Storm', 'Mist'],
  },
  {
    id: 'love-moon',
    messageType: 'love_interest',
    category: 'themed',
    text: 'This connection is which moon?',
    answerType: 'multiple_choice',
    options: ['New', 'Waxing', 'Full', 'Waning'],
  },
  {
    id: 'love-fear',
    messageType: 'love_interest',
    category: 'themed',
    text: 'What fear lives in this space?',
    answerType: 'multiple_choice',
    options: ['Loss', 'Rejection', 'Truth', 'Change'],
  },
  {
    id: 'love-gift',
    messageType: 'love_interest',
    category: 'themed',
    text: 'What gift do they carry for you?',
    answerType: 'multiple_choice',
    options: ['Mirror', 'Healing', 'Growth', 'Peace'],
  },
  {
    id: 'love-texture',
    messageType: 'love_interest',
    category: 'themed',
    text: 'What texture is this bond?',
    answerType: 'multiple_choice',
    options: ['Silk', 'Stone', 'Water', 'Flame'],
  },
  {
    id: 'love-direction',
    messageType: 'love_interest',
    category: 'themed',
    text: 'Which direction does this love pull?',
    answerType: 'multiple_choice',
    options: ['Forward', 'Back', 'Deeper', 'Upward'],
  },
  {
    id: 'love-animal',
    messageType: 'love_interest',
    category: 'themed',
    text: 'What animal embodies them?',
    answerType: 'multiple_choice',
    options: ['Lion', 'Deer', 'Wolf', 'Bird'],
  },
]

const deceasedLovedOneQuestions: Question[] = [
  {
    id: 'deceased-presence',
    messageType: 'deceased_loved_one',
    category: 'themed',
    text: 'In what form do you sense their presence?',
    answerType: 'multiple_choice',
    options: ['Dreams', 'Signs', 'Feelings', 'Memories'],
  },
  {
    id: 'deceased-teaching',
    messageType: 'deceased_loved_one',
    category: 'themed',
    text: 'What did they teach you without words?',
    answerType: 'multiple_choice',
    options: ['Patience', 'Strength', 'Joy', 'Courage'],
  },
  {
    id: 'deceased-season',
    messageType: 'deceased_loved_one',
    category: 'themed',
    text: 'Which season holds the strongest memories?',
    answerType: 'multiple_choice',
    options: ['Spring', 'Summer', 'Autumn', 'Winter'],
  },
  {
    id: 'deceased-time',
    messageType: 'deceased_loved_one',
    category: 'themed',
    text: 'What time of day do you think of them most?',
    answerType: 'multiple_choice',
    options: ['Morning', 'Afternoon', 'Evening', 'Night'],
  },
  {
    id: 'deceased-object',
    messageType: 'deceased_loved_one',
    category: 'themed',
    text: 'What object carries their essence?',
    answerType: 'multiple_choice',
    options: ['Photo', 'Letter', 'Jewelry', 'Clothing'],
  },
  {
    id: 'deceased-place',
    messageType: 'deceased_loved_one',
    category: 'themed',
    text: 'Where do you feel closest to them?',
    answerType: 'multiple_choice',
    options: ['Home', 'Nature', 'Sacred space', 'Everywhere'],
  },
  {
    id: 'deceased-element',
    messageType: 'deceased_loved_one',
    category: 'themed',
    text: 'Which element carries their spirit?',
    answerType: 'multiple_choice',
    options: ['Fire', 'Water', 'Earth', 'Air'],
  },
  {
    id: 'deceased-sound',
    messageType: 'deceased_loved_one',
    category: 'themed',
    text: 'What sound reminds you of them?',
    answerType: 'multiple_choice',
    options: ['Music', 'Laughter', 'Silence', 'Nature'],
  },
  {
    id: 'deceased-scent',
    messageType: 'deceased_loved_one',
    category: 'themed',
    text: 'What scent brings them near?',
    answerType: 'multiple_choice',
    options: ['Flowers', 'Food', 'Perfume', 'Earth'],
  },
  {
    id: 'deceased-message',
    messageType: 'deceased_loved_one',
    category: 'themed',
    text: 'How do they send messages?',
    answerType: 'multiple_choice',
    options: ['Dreams', 'Animals', 'Numbers', 'Songs'],
  },
  {
    id: 'deceased-emotion',
    messageType: 'deceased_loved_one',
    category: 'themed',
    text: 'What emotion rises when you think of them?',
    answerType: 'multiple_choice',
    options: ['Love', 'Longing', 'Gratitude', 'Peace'],
  },
  {
    id: 'deceased-gift',
    messageType: 'deceased_loved_one',
    category: 'themed',
    text: 'What gift did they leave you?',
    answerType: 'multiple_choice',
    options: ['Wisdom', 'Strength', 'Love', 'Freedom'],
  },
  {
    id: 'deceased-color',
    messageType: 'deceased_loved_one',
    category: 'themed',
    text: 'What color represents them?',
    answerType: 'multiple_choice',
    options: ['White', 'Blue', 'Gold', 'Green'],
  },
  {
    id: 'deceased-distance',
    messageType: 'deceased_loved_one',
    category: 'themed',
    text: 'How far away do they feel?',
    answerType: 'multiple_choice',
    options: ['Near', 'Far', 'Within you', 'Everywhere'],
  },
  {
    id: 'deceased-word',
    messageType: 'deceased_loved_one',
    category: 'themed',
    text: 'What word would they say to you now?',
    answerType: 'multiple_choice',
    options: ['Peace', 'Trust', 'Go', 'Love'],
  },
]

const futureSelfQuestions: Question[] = [
  {
    id: 'future-timeline',
    messageType: 'future_self',
    category: 'themed',
    text: 'How far ahead does your future self reside?',
    answerType: 'multiple_choice',
    options: ['1 year', '5 years', '10 years', 'Beyond time'],
  },
  {
    id: 'future-quality',
    messageType: 'future_self',
    category: 'themed',
    text: 'What quality have you cultivated?',
    answerType: 'multiple_choice',
    options: ['Patience', 'Courage', 'Wisdom', 'Peace'],
  },
  {
    id: 'future-dwelling',
    messageType: 'future_self',
    category: 'themed',
    text: 'Where does your future self dwell?',
    answerType: 'multiple_choice',
    options: ['Mountains', 'Ocean', 'Forest', 'City'],
  },
  {
    id: 'future-released',
    messageType: 'future_self',
    category: 'themed',
    text: 'What have you released?',
    answerType: 'multiple_choice',
    options: ['Fear', 'Doubt', 'Anger', 'Grief'],
  },
  {
    id: 'future-morning',
    messageType: 'future_self',
    category: 'themed',
    text: 'What does your future self do each morning?',
    answerType: 'multiple_choice',
    options: ['Create', 'Move', 'Stillness', 'Connect'],
  },
  {
    id: 'future-surprise',
    messageType: 'future_self',
    category: 'themed',
    text: 'What surprised you about becoming them?',
    answerType: 'multiple_choice',
    options: ['Softness', 'Strength', 'Simplicity', 'Joy'],
  },
  {
    id: 'future-element',
    messageType: 'future_self',
    category: 'themed',
    text: 'Which element guides your future self?',
    answerType: 'multiple_choice',
    options: ['Fire', 'Water', 'Earth', 'Air'],
  },
  {
    id: 'future-color',
    messageType: 'future_self',
    category: 'themed',
    text: 'What color does your future self wear?',
    answerType: 'multiple_choice',
    options: ['White', 'Black', 'Gold', 'Blue'],
  },
  {
    id: 'future-work',
    messageType: 'future_self',
    category: 'themed',
    text: 'What is your future self\'s work?',
    answerType: 'multiple_choice',
    options: ['Creating', 'Healing', 'Teaching', 'Leading'],
  },
  {
    id: 'future-company',
    messageType: 'future_self',
    category: 'themed',
    text: 'Who surrounds your future self?',
    answerType: 'multiple_choice',
    options: ['Many', 'Few', 'One', 'Solitude'],
  },
  {
    id: 'future-pace',
    messageType: 'future_self',
    category: 'themed',
    text: 'What is the pace of that life?',
    answerType: 'multiple_choice',
    options: ['Slow', 'Rhythmic', 'Fast', 'Still'],
  },
  {
    id: 'future-advice',
    messageType: 'future_self',
    category: 'themed',
    text: 'What would they tell you now?',
    answerType: 'multiple_choice',
    options: ['Trust', 'Wait', 'Leap', 'Rest'],
  },
  {
    id: 'future-sacrifice',
    messageType: 'future_self',
    category: 'themed',
    text: 'What did you have to let go of?',
    answerType: 'multiple_choice',
    options: ['Control', 'Safety', 'Others\' opinions', 'The past'],
  },
  {
    id: 'future-gain',
    messageType: 'future_self',
    category: 'themed',
    text: 'What did you gain?',
    answerType: 'multiple_choice',
    options: ['Freedom', 'Love', 'Purpose', 'Peace'],
  },
  {
    id: 'future-animal',
    messageType: 'future_self',
    category: 'themed',
    text: 'What animal walks with your future self?',
    answerType: 'multiple_choice',
    options: ['Eagle', 'Bear', 'Dolphin', 'Wolf'],
  },
]

const universeGeneralQuestions: Question[] = [
  {
    id: 'universe-pattern',
    messageType: 'universe_general',
    category: 'themed',
    text: 'What pattern keeps appearing in your life?',
    answerType: 'multiple_choice',
    options: ['Cycles', 'Mirrors', 'Doors', 'Threads'],
  },
  {
    id: 'universe-celestial',
    messageType: 'universe_general',
    category: 'themed',
    text: 'Which celestial body calls to you?',
    answerType: 'multiple_choice',
    options: ['Sun', 'Moon', 'Stars', 'Void'],
  },
  {
    id: 'universe-symbol',
    messageType: 'universe_general',
    category: 'themed',
    text: 'What symbol appears when you close your eyes?',
    answerType: 'multiple_choice',
    options: ['Circle', 'Spiral', 'Triangle', 'Wave'],
  },
  {
    id: 'universe-element',
    messageType: 'universe_general',
    category: 'themed',
    text: 'What element is calling you right now?',
    answerType: 'multiple_choice',
    options: ['Fire', 'Water', 'Earth', 'Air'],
  },
  {
    id: 'universe-time',
    messageType: 'universe_general',
    category: 'themed',
    text: 'What time of day feels most alive?',
    answerType: 'multiple_choice',
    options: ['Dawn', 'Noon', 'Dusk', 'Midnight'],
  },
  {
    id: 'universe-trust',
    messageType: 'universe_general',
    category: 'themed',
    text: 'What are you being asked to trust?',
    answerType: 'multiple_choice',
    options: ['Timing', 'Process', 'Self', 'Unknown'],
  },
  {
    id: 'universe-season',
    messageType: 'universe_general',
    category: 'themed',
    text: 'What season is your soul in?',
    answerType: 'multiple_choice',
    options: ['Spring', 'Summer', 'Autumn', 'Winter'],
  },
  {
    id: 'universe-lesson',
    messageType: 'universe_general',
    category: 'themed',
    text: 'What lesson keeps returning?',
    answerType: 'multiple_choice',
    options: ['Patience', 'Surrender', 'Boundaries', 'Trust'],
  },
  {
    id: 'universe-gift',
    messageType: 'universe_general',
    category: 'themed',
    text: 'What gift is trying to reach you?',
    answerType: 'multiple_choice',
    options: ['Clarity', 'Love', 'Healing', 'Purpose'],
  },
  {
    id: 'universe-direction',
    messageType: 'universe_general',
    category: 'themed',
    text: 'Which direction is the universe pulling you?',
    answerType: 'multiple_choice',
    options: ['Inward', 'Outward', 'Forward', 'Still'],
  },
  {
    id: 'universe-portal',
    messageType: 'universe_general',
    category: 'themed',
    text: 'What kind of portal is opening?',
    answerType: 'multiple_choice',
    options: ['Door', 'Window', 'Mirror', 'Void'],
  },
  {
    id: 'universe-number',
    messageType: 'universe_general',
    category: 'themed',
    text: 'What number keeps appearing?',
    answerType: 'multiple_choice',
    options: ['1', '3', '7', '11'],
  },
  {
    id: 'universe-animal',
    messageType: 'universe_general',
    category: 'themed',
    text: 'What animal messenger appears?',
    answerType: 'multiple_choice',
    options: ['Crow', 'Butterfly', 'Snake', 'Owl'],
  },
  {
    id: 'universe-moon',
    messageType: 'universe_general',
    category: 'themed',
    text: 'What phase is your inner moon?',
    answerType: 'multiple_choice',
    options: ['New', 'Waxing', 'Full', 'Waning'],
  },
  {
    id: 'universe-sound',
    messageType: 'universe_general',
    category: 'themed',
    text: 'What sound does the universe make for you?',
    answerType: 'multiple_choice',
    options: ['Hum', 'Silence', 'Music', 'Whisper'],
  },
]

const lifeDecisionQuestions: Question[] = [
  {
    id: 'decision-paths',
    messageType: 'life_decision',
    category: 'themed',
    text: 'How many paths do you see before you?',
    answerType: 'multiple_choice',
    options: ['Two', 'Three', 'Many', 'None are clear'],
  },
  {
    id: 'decision-fear',
    messageType: 'life_decision',
    category: 'themed',
    text: 'What does fear want you to choose?',
    answerType: 'multiple_choice',
    options: ['Safety', 'Familiarity', 'Nothing', 'Everything'],
  },
  {
    id: 'decision-stakes',
    messageType: 'life_decision',
    category: 'themed',
    text: 'What stakes feel heaviest?',
    answerType: 'multiple_choice',
    options: ['Time', 'Identity', 'Relationships', 'Security'],
  },
  {
    id: 'decision-younger',
    messageType: 'life_decision',
    category: 'themed',
    text: 'What would your younger self choose?',
    answerType: 'multiple_choice',
    options: ['Adventure', 'Safety', 'Love', 'Freedom'],
  },
  {
    id: 'decision-regret',
    messageType: 'life_decision',
    category: 'themed',
    text: 'What would you regret not trying?',
    answerType: 'multiple_choice',
    options: ['The leap', 'The stay', 'The ask', 'The release'],
  },
  {
    id: 'decision-body',
    messageType: 'life_decision',
    category: 'themed',
    text: 'What does your body know?',
    answerType: 'multiple_choice',
    options: ['Go', 'Wait', 'Return', 'Transform'],
  },
  {
    id: 'decision-weather',
    messageType: 'life_decision',
    category: 'themed',
    text: 'What weather is this decision?',
    answerType: 'multiple_choice',
    options: ['Storm', 'Fog', 'Clearing', 'Dawn'],
  },
  {
    id: 'decision-color',
    messageType: 'life_decision',
    category: 'themed',
    text: 'What color is this crossroads?',
    answerType: 'multiple_choice',
    options: ['Red', 'Blue', 'Gray', 'Gold'],
  },
  {
    id: 'decision-element',
    messageType: 'life_decision',
    category: 'themed',
    text: 'Which element should guide this choice?',
    answerType: 'multiple_choice',
    options: ['Fire', 'Water', 'Earth', 'Air'],
  },
  {
    id: 'decision-time',
    messageType: 'life_decision',
    category: 'themed',
    text: 'How long have you been here?',
    answerType: 'multiple_choice',
    options: ['Days', 'Months', 'Years', 'Lifetimes'],
  },
  {
    id: 'decision-advisor',
    messageType: 'life_decision',
    category: 'themed',
    text: 'Whose voice do you hear?',
    answerType: 'multiple_choice',
    options: ['Parent', 'Friend', 'Self', 'Unknown'],
  },
  {
    id: 'decision-lose',
    messageType: 'life_decision',
    category: 'themed',
    text: 'What might you lose?',
    answerType: 'multiple_choice',
    options: ['Comfort', 'Love', 'Self', 'Nothing real'],
  },
  {
    id: 'decision-gain',
    messageType: 'life_decision',
    category: 'themed',
    text: 'What might you gain?',
    answerType: 'multiple_choice',
    options: ['Freedom', 'Growth', 'Peace', 'Truth'],
  },
  {
    id: 'decision-moon',
    messageType: 'life_decision',
    category: 'themed',
    text: 'This choice is which moon?',
    answerType: 'multiple_choice',
    options: ['New', 'Waxing', 'Full', 'Waning'],
  },
  {
    id: 'decision-animal',
    messageType: 'life_decision',
    category: 'themed',
    text: 'What animal guards this crossroads?',
    answerType: 'multiple_choice',
    options: ['Raven', 'Fox', 'Bear', 'Spider'],
  },
]

const purposeWorldQuestions: Question[] = [
  {
    id: 'purpose-gift',
    messageType: 'purpose_world',
    category: 'themed',
    text: 'What gift do you bring that others need?',
    answerType: 'multiple_choice',
    options: ['Clarity', 'Presence', 'Joy', 'Healing'],
  },
  {
    id: 'purpose-alive',
    messageType: 'purpose_world',
    category: 'themed',
    text: 'When do you feel most alive?',
    answerType: 'multiple_choice',
    options: ['Creating', 'Connecting', 'Teaching', 'Healing'],
  },
  {
    id: 'purpose-impact',
    messageType: 'purpose_world',
    category: 'themed',
    text: 'What impact do you wish to leave?',
    answerType: 'multiple_choice',
    options: ['Understanding', 'Creation', 'Peace', 'Change'],
  },
  {
    id: 'purpose-thanks',
    messageType: 'purpose_world',
    category: 'themed',
    text: 'What do people thank you for?',
    answerType: 'multiple_choice',
    options: ['Listening', 'Seeing', 'Inspiring', 'Holding'],
  },
  {
    id: 'purpose-free',
    messageType: 'purpose_world',
    category: 'themed',
    text: 'What work would you do for free?',
    answerType: 'multiple_choice',
    options: ['Build', 'Teach', 'Heal', 'Create'],
  },
  {
    id: 'purpose-child',
    messageType: 'purpose_world',
    category: 'themed',
    text: 'What did child-you want to be?',
    answerType: 'multiple_choice',
    options: ['Explorer', 'Artist', 'Helper', 'Leader'],
  },
  {
    id: 'purpose-element',
    messageType: 'purpose_world',
    category: 'themed',
    text: 'Which element powers your purpose?',
    answerType: 'multiple_choice',
    options: ['Fire', 'Water', 'Earth', 'Air'],
  },
  {
    id: 'purpose-color',
    messageType: 'purpose_world',
    category: 'themed',
    text: 'What color is your purpose?',
    answerType: 'multiple_choice',
    options: ['Gold', 'Blue', 'Green', 'White'],
  },
  {
    id: 'purpose-scale',
    messageType: 'purpose_world',
    category: 'themed',
    text: 'What scale feels right?',
    answerType: 'multiple_choice',
    options: ['One person', 'Community', 'Nation', 'World'],
  },
  {
    id: 'purpose-tool',
    messageType: 'purpose_world',
    category: 'themed',
    text: 'What is your tool?',
    answerType: 'multiple_choice',
    options: ['Words', 'Hands', 'Heart', 'Mind'],
  },
  {
    id: 'purpose-block',
    messageType: 'purpose_world',
    category: 'themed',
    text: 'What blocks your purpose?',
    answerType: 'multiple_choice',
    options: ['Fear', 'Doubt', 'Time', 'Others'],
  },
  {
    id: 'purpose-space',
    messageType: 'purpose_world',
    category: 'themed',
    text: 'Where does your purpose live?',
    answerType: 'multiple_choice',
    options: ['Inside', 'Between people', 'In nature', 'Everywhere'],
  },
  {
    id: 'purpose-time',
    messageType: 'purpose_world',
    category: 'themed',
    text: 'When does your purpose shine?',
    answerType: 'multiple_choice',
    options: ['Crisis', 'Calm', 'Creation', 'Connection'],
  },
  {
    id: 'purpose-ancestor',
    messageType: 'purpose_world',
    category: 'themed',
    text: 'What purpose flows through your lineage?',
    answerType: 'multiple_choice',
    options: ['Survival', 'Service', 'Creation', 'Truth'],
  },
  {
    id: 'purpose-animal',
    messageType: 'purpose_world',
    category: 'themed',
    text: 'What animal shares your purpose?',
    answerType: 'multiple_choice',
    options: ['Bee', 'Lion', 'Elephant', 'Whale'],
  },
]

// Combine type-specific with some universal questions for variety
const themedQuestions: Record<MessageType, Question[]> = {
  love_interest: [...loveInterestQuestions, ...colorQuestions.slice(0, 2), ...cosmicQuestions.slice(0, 2)],
  deceased_loved_one: [...deceasedLovedOneQuestions, ...symbolicQuestions.slice(0, 2), ...emotionalQuestions.slice(0, 2)],
  future_self: [...futureSelfQuestions, ...cosmicQuestions.slice(0, 2), ...colorQuestions.slice(0, 2)],
  universe_general: [...universeGeneralQuestions, ...symbolicQuestions.slice(0, 2), ...cosmicQuestions.slice(0, 2)],
  life_decision: [...lifeDecisionQuestions, ...emotionalQuestions.slice(0, 2), ...symbolicQuestions.slice(0, 2)],
  purpose_world: [...purposeWorldQuestions, ...cosmicQuestions.slice(0, 2), ...emotionalQuestions.slice(0, 2)],
}

// Grounding questions (used for all message types) - intuitive, present-moment
const groundingQuestions: Question[] = [
  {
    id: 'ground-light',
    messageType: null,
    category: 'grounding',
    text: 'What is the light like in this moment?',
    answerType: 'multiple_choice',
    options: ['Soft', 'Harsh', 'Diffuse', 'Absent'],
  },
  {
    id: 'ground-breath',
    messageType: null,
    category: 'grounding',
    text: 'What word captures the feeling of your breath?',
    answerType: 'multiple_choice',
    options: ['Easy', 'Labored', 'Shallow', 'Deep'],
  },
  {
    id: 'ground-moment-color',
    messageType: null,
    category: 'grounding',
    text: 'If this moment were a color?',
    answerType: 'multiple_choice',
    options: ['Clear', 'Muted', 'Vibrant', 'Dark'],
  },
  {
    id: 'ground-body',
    messageType: null,
    category: 'grounding',
    text: 'What is the overall feeling of your body?',
    answerType: 'multiple_choice',
    options: ['Relaxed', 'Tense', 'Energetic', 'Heavy'],
  },
  {
    id: 'ground-spaciousness',
    messageType: null,
    category: 'grounding',
    text: 'What is your sense of spaciousness right now?',
    answerType: 'multiple_choice',
    options: ['Open', 'Enclosed', 'Vast', 'Limited'],
  },
  {
    id: 'ground-time-feel',
    messageType: null,
    category: 'grounding',
    text: 'How fast is time moving for you?',
    answerType: 'multiple_choice',
    options: ['Quickly', 'Slowly', 'Normally', 'Not at all'],
  },
  {
    id: 'ground-hands',
    messageType: null,
    category: 'grounding',
    text: 'What is the sensation in your hands?',
    answerType: 'multiple_choice',
    options: ['Warmth', 'Coolness', 'Tingling', 'Stillness'],
  },
  {
    id: 'ground-feeling',
    messageType: null,
    category: 'grounding',
    text: 'What feeling is strongest right now?',
    answerType: 'multiple_choice',
    options: ['Calm', 'Curiosity', 'Anticipation', 'Contentment'],
  },
  {
    id: 'ground-texture',
    messageType: null,
    category: 'grounding',
    text: 'What texture comes to mind?',
    answerType: 'multiple_choice',
    options: ['Smooth', 'Rough', 'Soft', 'Sharp'],
  },
  {
    id: 'ground-space-energy',
    messageType: null,
    category: 'grounding',
    text: 'How would you describe this space\'s energy?',
    answerType: 'multiple_choice',
    options: ['Grounded', 'Airy', 'Vibrant', 'Still'],
  },
  {
    id: 'ground-surroundings',
    messageType: null,
    category: 'grounding',
    text: 'What is the feeling of your surroundings?',
    answerType: 'multiple_choice',
    options: ['Open', 'Confined', 'Expansive', 'Intimate'],
  },
  {
    id: 'ground-eyes',
    messageType: null,
    category: 'grounding',
    text: 'Close your eyes briefly. What do you notice first?',
    answerType: 'multiple_choice',
    options: ['Light', 'Darkness', 'Movement', 'Pressure'],
  },
]

// Weird/rare questions (occasionally rotated in)
const weirdQuestions: Question[] = [
  {
    id: 'weird-number',
    messageType: null,
    category: 'weird',
    text: 'A number keeps appearing. What is it?',
    answerType: 'multiple_choice',
    options: ['3', '7', '11', '22'],
  },
  {
    id: 'weird-weather',
    messageType: null,
    category: 'weird',
    text: 'If your mood were weather?',
    answerType: 'multiple_choice',
    options: ['Clear sky', 'Gentle rain', 'Storm', 'Fog'],
  },
  {
    id: 'weird-animal',
    messageType: null,
    category: 'weird',
    text: 'What animal has appeared in your thoughts?',
    answerType: 'multiple_choice',
    options: ['Bird', 'Wolf', 'Cat', 'Snake'],
  },
  {
    id: 'weird-direction',
    messageType: null,
    category: 'weird',
    text: 'Pick a direction.',
    answerType: 'multiple_choice',
    options: ['North', 'South', 'East', 'West'],
  },
  {
    id: 'weird-door',
    messageType: null,
    category: 'weird',
    text: 'A door appears. What color is it?',
    answerType: 'multiple_choice',
    options: ['Red', 'Blue', 'Black', 'Gold'],
  },
  {
    id: 'weird-key',
    messageType: null,
    category: 'weird',
    text: 'You find a key. What does it unlock?',
    answerType: 'multiple_choice',
    options: ['Room', 'Heart', 'Memory', 'Nothing'],
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
  // Randomly select 3 from themed questions (15-19 per type)
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
