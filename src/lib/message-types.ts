/**
 * Message type configurations
 */

import type { MessageType, MessageTypeConfig } from './types'

export const messageTypes: MessageTypeConfig[] = [
  {
    id: 'love_interest',
    label: 'The Beloved',
    description: 'What echoes between you',
    voice: 'Higher self of the beloved',
    icon: 'heart',
    intentionPrompt: 'What remains unspoken?',
    intentionPlaceholder: 'The words that live between you...',
  },
  {
    id: 'deceased_loved_one',
    label: 'The Ancestor',
    description: 'From a familiar silence',
    voice: 'Crossed-over spirit',
    icon: 'star',
    intentionPrompt: 'What echoes still?',
    intentionPlaceholder: 'What you long to hear, or say...',
  },
  {
    id: 'future_self',
    label: 'The Sage',
    description: 'A glimpse of what you might know',
    voice: 'Your wiser future self',
    icon: 'clock',
    intentionPrompt: 'What would your future self say?',
    intentionPlaceholder: 'The counsel you need now...',
  },
  {
    id: 'universe_general',
    label: 'The Cosmos',
    description: 'A voice from nowhere in particular',
    voice: 'Cosmic consciousness',
    icon: 'sparkles',
    intentionPrompt: 'What stirs within you?',
    intentionPlaceholder: 'The question beneath the question...',
  },
  {
    id: 'life_decision',
    label: 'The Crossroads',
    description: 'Clarity from the impartial eye',
    voice: 'Impartial oracle',
    icon: 'compass',
    intentionPrompt: 'Which path calls to you?',
    intentionPlaceholder: 'The choice that weighs on you...',
  },
  {
    id: 'purpose_world',
    label: 'The Calling',
    description: 'What might be asked of you',
    voice: 'Collective consciousness',
    icon: 'globe',
    intentionPrompt: 'What wants to emerge through you?',
    intentionPlaceholder: 'Your gift to the world...',
  },
]

export function getMessageTypeConfig(type: MessageType): MessageTypeConfig | undefined {
  return messageTypes.find(m => m.id === type)
}
