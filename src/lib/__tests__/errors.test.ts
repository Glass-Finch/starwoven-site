import { describe, it, expect } from 'vitest'

import { classifyError } from '../errors'

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
