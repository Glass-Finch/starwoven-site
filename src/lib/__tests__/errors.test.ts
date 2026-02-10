import { describe, it, expect } from 'vitest'

import { classifyError, ERROR_MESSAGES, ERROR_TIPS } from '../errors'

describe('classifyError', () => {
  it('classifies 429 as rate_limit', () => {
    expect(classifyError('API error: 429')).toBe('rate_limit')
  })

  it('classifies timeout errors', () => {
    expect(classifyError('Request timeout')).toBe('timeout')
    expect(classifyError('Timeout exceeded')).toBe('timeout')
  })

  it('classifies network errors', () => {
    expect(classifyError('network error')).toBe('network')
    expect(classifyError('Network request failed')).toBe('network')
    expect(classifyError('fetch failed')).toBe('network')
  })

  it('classifies server errors', () => {
    expect(classifyError('API error: 500')).toBe('server')
    expect(classifyError('API call failed')).toBe('server')
  })

  it('classifies unknown errors as unknown', () => {
    expect(classifyError('Something went wrong')).toBe('unknown')
    expect(classifyError('')).toBe('unknown')
  })
})

describe('ERROR_MESSAGES', () => {
  it('has a message for every error kind', () => {
    const kinds = ['rate_limit', 'timeout', 'network', 'server', 'unknown'] as const
    for (const kind of kinds) {
      expect(typeof ERROR_MESSAGES[kind]).toBe('string')
      expect(ERROR_MESSAGES[kind].length).toBeGreaterThan(0)
    }
  })
})

describe('ERROR_TIPS', () => {
  it('has an entry for every error kind', () => {
    const kinds = ['rate_limit', 'timeout', 'network', 'server', 'unknown'] as const
    for (const kind of kinds) {
      expect(kind in ERROR_TIPS).toBe(true)
    }
  })

  it('returns null for rate_limit (no tip needed)', () => {
    expect(ERROR_TIPS.rate_limit).toBeNull()
  })

  it('returns strings for all other kinds', () => {
    expect(typeof ERROR_TIPS.timeout).toBe('string')
    expect(typeof ERROR_TIPS.network).toBe('string')
    expect(typeof ERROR_TIPS.server).toBe('string')
    expect(typeof ERROR_TIPS.unknown).toBe('string')
  })
})
