/**
 * Error classification for user-facing error messages and tips
 */

export type ErrorKind = 'rate_limit' | 'timeout' | 'network' | 'server' | 'unknown'

export function classifyError(error: string): ErrorKind {
  if (error.includes('429')) return 'rate_limit'
  if (error.includes('timeout') || error.includes('Timeout')) return 'timeout'
  if (error.includes('network') || error.includes('Network') || error.includes('fetch'))
    return 'network'
  if (error.includes('500') || error.includes('API')) return 'server'
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
