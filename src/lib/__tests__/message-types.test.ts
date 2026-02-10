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

describe('messageTypes', () => {
  it('contains exactly 6 message types', () => {
    expect(messageTypes).toHaveLength(6)
  })

  it('contains all expected type IDs', () => {
    const ids = messageTypes.map((m) => m.id)
    expect(ids).toEqual(ALL_TYPE_IDS)
  })

  it('every config has required fields', () => {
    for (const config of messageTypes) {
      expect(config.id).toBeTruthy()
      expect(config.label).toBeTruthy()
      expect(config.description).toBeTruthy()
      expect(config.voice).toBeTruthy()
      expect(config.icon).toBeTruthy()
      expect(config.intentionPrompt).toBeTruthy()
      expect(config.intentionPlaceholder).toBeTruthy()
      expect(config.inputFields).toBeDefined()
    }
  })
})

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

  it('beloved has 2 input fields (yourName, theirName)', () => {
    const config = getMessageTypeConfig('beloved')
    expect(config?.inputFields).toHaveLength(2)
    expect(config?.inputFields.map((f) => f.name)).toEqual(['yourName', 'theirName'])
  })

  it('ancestor has 3 input fields (yourName, theirName, relationship)', () => {
    const config = getMessageTypeConfig('ancestor')
    expect(config?.inputFields).toHaveLength(3)
    expect(config?.inputFields.map((f) => f.name)).toEqual([
      'yourName',
      'theirName',
      'relationship',
    ])
  })

  it('sage has 2 input fields (yourName, birthday)', () => {
    const config = getMessageTypeConfig('sage')
    expect(config?.inputFields).toHaveLength(2)
    expect(config?.inputFields.map((f) => f.name)).toEqual(['yourName', 'birthday'])
  })

  it('cosmos has 0 input fields', () => {
    const config = getMessageTypeConfig('cosmos')
    expect(config?.inputFields).toHaveLength(0)
  })

  it('crossroads has 0 input fields', () => {
    const config = getMessageTypeConfig('crossroads')
    expect(config?.inputFields).toHaveLength(0)
  })

  it('calling has 2 input fields (yourName, birthday)', () => {
    const config = getMessageTypeConfig('calling')
    expect(config?.inputFields).toHaveLength(2)
    expect(config?.inputFields.map((f) => f.name)).toEqual(['yourName', 'birthday'])
  })

  it('birthday fields use date type', () => {
    const sage = getMessageTypeConfig('sage')
    const calling = getMessageTypeConfig('calling')
    expect(sage?.inputFields.find((f) => f.name === 'birthday')?.type).toBe('date')
    expect(calling?.inputFields.find((f) => f.name === 'birthday')?.type).toBe('date')
  })

  it('all input fields are required', () => {
    for (const config of messageTypes) {
      for (const field of config.inputFields) {
        expect(field.required).toBe(true)
      }
    }
  })

  it('labels follow "The X" pattern', () => {
    for (const config of messageTypes) {
      expect(config.label).toMatch(/^The /)
    }
  })
})
