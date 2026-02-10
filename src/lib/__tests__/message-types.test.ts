import { describe, it, expect } from 'vitest'

import { messageTypes, getMessageTypeConfig } from '../message-types'
import type { MessageType } from '../types'

const ALL_TYPE_IDS: MessageType[] = [
  'beloved',
  'ancestor',
  'sage',
  'cosmos',
  'crossroads',
  'calling',
]

describe('getMessageTypeConfig', () => {
  it('returns config for each valid type', () => {
    for (const id of ALL_TYPE_IDS) {
      const config = getMessageTypeConfig(id)
      expect(config).toBeDefined()
      expect(config?.id).toBe(id)
    }
  })

  it('returns undefined for invalid type', () => {
    const config = getMessageTypeConfig('nonexistent' as MessageType)
    expect(config).toBeUndefined()
  })

  it('labels follow "The X" pattern', () => {
    for (const config of messageTypes) {
      expect(config.label).toMatch(/^The /)
    }
  })
})
