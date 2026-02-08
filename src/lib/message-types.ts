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
  },
  {
    id: 'deceased_loved_one',
    label: 'Crossed Over',
    description: 'Receive a message from beyond the veil',
    voice: 'Crossed-over spirit',
    icon: 'star',
  },
  {
    id: 'future_self',
    label: 'Future Self',
    description: 'Your wiser self sends wisdom backward through time',
    voice: "User's wiser future self",
    icon: 'clock',
  },
  {
    id: 'universe_general',
    label: 'The Universe',
    description: 'Open a channel to cosmic consciousness',
    voice: 'Cosmic consciousness',
    icon: 'sparkles',
  },
  {
    id: 'life_decision',
    label: 'Life Decision',
    description: 'Seek guidance from an impartial oracle',
    voice: 'Impartial oracle',
    icon: 'compass',
  },
  {
    id: 'purpose_world',
    label: 'Purpose',
    description: 'Discover your role in the greater weave',
    voice: 'Collective consciousness',
    icon: 'globe',
  },
]

export function getMessageTypeConfig(type: MessageType): MessageTypeConfig | undefined {
  return messageTypes.find(m => m.id === type)
}
