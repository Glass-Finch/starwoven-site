/**
 * Error classification for user-facing error messages and tips
 */

import { MAX_INTENTION_LENGTH } from './constants'

export type ErrorKind = 'rate_limit' | 'timeout' | 'network' | 'server' | 'unknown'

export function classifyError(error: string): ErrorKind {
  const lower = error.toLowerCase()
  if (lower.includes('429')) return 'rate_limit'
  if (lower.includes('timeout')) return 'timeout'
  if (lower.includes('network') || lower.includes('fetch')) return 'network'
  if (lower.includes('500') || lower.includes('api')) return 'server'
  return 'unknown'
}

export const ERROR_MESSAGES: Record<ErrorKind, string> = {
  rate_limit: 'The oracles need a moment of stillness. Please wait before asking again.',
  timeout: 'The connection timed out.',
  network: "Couldn't reach the oracles. Check your connection.",
  server: "One or more oracles didn't respond.",
  unknown: 'The transmission was interrupted.',
}

export const ERROR_TIPS: Record<ErrorKind, string | null> = {
  rate_limit: null,
  timeout: 'The oracles are taking longer than usual.',
  network: 'Check your connection and try again.',
  server: 'A more focused question may help.',
  unknown: 'Consider reframing your question.',
}

// Route-level error messages (in-character, user-facing)
export const ROUTE_ERRORS = {
  RATE_LIMITED: ERROR_MESSAGES.rate_limit,
  BAD_REQUEST: 'The request could not be understood.',
  MISSING_FIELDS: 'Missing required fields.',
  INVALID_TYPE: 'Invalid message type.',
  INVALID_COORDINATES: 'Invalid coordinates.',
  INTENTION_TOO_LONG: `Intention must be ${MAX_INTENTION_LENGTH} characters or fewer.`,
  MODERATION_FALLBACK: 'This intention could not be processed.',
  NO_RESPONSES: "The oracles couldn't connect. Please try again.",
  CHANNELS_SILENT: 'The channels remain silent at this time. Please try again.',
  GENERIC: 'An error occurred while channeling. Please try again.',
} as const
