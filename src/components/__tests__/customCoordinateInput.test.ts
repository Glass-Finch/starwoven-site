import { describe, it, expect } from 'vitest'

import { stripToDigits, formatCoordinate } from '../CustomCoordinateInput'

describe('stripToDigits', () => {
  it('strips non-digit characters', () => {
    expect(stripToDigits('1986-0923-4217')).toBe('198609234217')
  })

  it('strips spaces', () => {
    expect(stripToDigits('1234 5678')).toBe('12345678')
  })

  it('strips letters', () => {
    expect(stripToDigits('abc123def456')).toBe('123456')
  })

  it('returns empty string for no digits', () => {
    expect(stripToDigits('---')).toBe('')
    expect(stripToDigits('')).toBe('')
  })

  it('preserves digits-only input', () => {
    expect(stripToDigits('12345678')).toBe('12345678')
  })
})

describe('formatCoordinate', () => {
  it('groups digits into chunks of 4 with dashes', () => {
    expect(formatCoordinate('12345678')).toBe('1234-5678')
  })

  it('handles input shorter than 4 digits', () => {
    expect(formatCoordinate('123')).toBe('123')
    expect(formatCoordinate('1')).toBe('1')
  })

  it('handles exactly 4 digits', () => {
    expect(formatCoordinate('1234')).toBe('1234')
  })

  it('handles input not evenly divisible by 4', () => {
    expect(formatCoordinate('123456')).toBe('1234-56')
    expect(formatCoordinate('1234567890')).toBe('1234-5678-90')
  })

  it('handles empty string', () => {
    expect(formatCoordinate('')).toBe('')
  })
})
