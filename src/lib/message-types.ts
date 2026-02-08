/**
 * Message type configurations
 */

import type { MessageType, MessageTypeConfig } from './types'

export const messageTypes: MessageTypeConfig[] = [
  {
    id: 'love_interest',
    label: 'Love Interest',
    description: 'Hear from the higher self of someone you love',
    voice: 'Higher self of the beloved',
    icon: 'heart',
    intentionPrompt: 'What do you want to know about them?',
    intentionPlaceholder: 'What lives unspoken between you...',
  },
  {
    id: 'deceased_loved_one',
    label: 'Crossed Over',
    description: 'Receive a message from beyond the veil',
    voice: 'Crossed-over spirit',
    icon: 'star',
    intentionPrompt: 'What would you hear from them?',
    intentionPlaceholder: 'What you wish they knew, or need to hear...',
  },
  {
    id: 'future_self',
    label: 'Future Self',
    description: 'Your wiser self sends wisdom backward through time',
    voice: "User's wiser future self",
    icon: 'clock',
    intentionPrompt: 'What guidance do you seek?',
    intentionPlaceholder: 'What your future self might say...',
  },
  {
    id: 'universe_general',
    label: 'The Universe',
    description: 'Open a channel to cosmic consciousness',
    voice: 'Cosmic consciousness',
    icon: 'sparkles',
    intentionPrompt: 'What question lives in you?',
    intentionPlaceholder: 'The question that won\'t rest...',
  },
  {
    id: 'life_decision',
    label: 'Life Decision',
    description: 'Seek guidance from an impartial oracle',
    voice: 'Impartial oracle',
    icon: 'compass',
    intentionPrompt: 'What choice weighs on you?',
    intentionPlaceholder: 'The crossroads you stand at...',
  },
  {
    id: 'purpose_world',
    label: 'Purpose',
    description: 'Discover your role in the greater weave',
    voice: 'Collective consciousness',
    icon: 'globe',
    intentionPrompt: 'What calls to be understood?',
    intentionPlaceholder: 'Your place in the larger pattern...',
  },
]

export function getMessageTypeConfig(type: MessageType): MessageTypeConfig | undefined {
  return messageTypes.find(m => m.id === type)
}
