/**
 * Message type configurations
 */

import type { MessageType, MessageTypeConfig } from './types'

export const messageTypes: MessageTypeConfig[] = [
  {
    id: 'beloved',
    label: 'The Beloved',
    description: 'Ask about a romantic connection',
    voice: 'Higher self of the beloved',
    icon: 'heart',
    intentionPrompt: 'What do you want to know?',
    intentionPlaceholder: 'Does this person like me? What do they really feel? Is there a future here?',
    inputFields: [
      {
        name: 'yourName',
        label: 'Your name',
        placeholder: 'Your first name...',
        type: 'text',
        required: true,
      },
      {
        name: 'theirName',
        label: 'Their name',
        placeholder: 'Their name or what you call them...',
        type: 'text',
        required: true,
      },
    ],
  },
  {
    id: 'ancestor',
    label: 'The Ancestor',
    description: 'Seek connection with someone who has passed',
    voice: 'Crossed-over spirit',
    icon: 'star',
    intentionPrompt: 'What do you want to ask or tell them?',
    intentionPlaceholder: 'Are they okay? Do they forgive me? What would they say to me now?',
    inputFields: [
      {
        name: 'yourName',
        label: 'Your name',
        placeholder: 'Your first name...',
        type: 'text',
        required: true,
      },
      {
        name: 'theirName',
        label: 'Their name',
        placeholder: 'Their name...',
        type: 'text',
        required: true,
      },
      {
        name: 'relationship',
        label: 'Your relationship',
        placeholder: 'e.g., grandmother, father, friend...',
        type: 'text',
        required: true,
      },
    ],
  },
  {
    id: 'sage',
    label: 'The Sage',
    description: 'Ask your future self for advice',
    voice: 'Your wiser future self',
    icon: 'clock',
    intentionPrompt: 'What do you need advice on?',
    intentionPlaceholder: 'Should I take this job? Am I on the right path? What should I focus on?',
    inputFields: [
      {
        name: 'yourName',
        label: 'Your name',
        placeholder: 'Your first name...',
        type: 'text',
        required: true,
      },
      {
        name: 'birthday',
        label: 'Your birthday',
        placeholder: '',
        type: 'date',
        required: true,
      },
    ],
  },
  {
    id: 'cosmos',
    label: 'The Cosmos',
    description: 'Seek insight on what\'s on your mind',
    voice: 'Cosmic consciousness',
    icon: 'sparkles',
    intentionPrompt: 'What\'s on your mind?',
    intentionPlaceholder: 'What do I need to hear right now? What am I not seeing?',
    inputFields: [],
  },
  {
    id: 'crossroads',
    label: 'The Crossroads',
    description: 'Get clarity on a yes or no decision',
    voice: 'Impartial oracle',
    icon: 'compass',
    intentionPrompt: 'What decision do you need help with?',
    intentionPlaceholder: 'Should I take the job? Should I move? Is it time to end this?',
    inputFields: [],
  },
  {
    id: 'calling',
    label: 'The Calling',
    description: 'Explore your purpose',
    voice: 'Collective consciousness',
    icon: 'globe',
    intentionPrompt: 'What do you want to know about your purpose?',
    intentionPlaceholder: 'What is my purpose? What am I meant to do? What is my calling?',
    inputFields: [
      {
        name: 'yourName',
        label: 'Your name',
        placeholder: 'Your first name...',
        type: 'text',
        required: true,
      },
      {
        name: 'birthday',
        label: 'Your birthday',
        placeholder: '',
        type: 'date',
        required: true,
      },
    ],
  },
]

export function getMessageTypeConfig(type: MessageType): MessageTypeConfig | undefined {
  return messageTypes.find(m => m.id === type)
}
