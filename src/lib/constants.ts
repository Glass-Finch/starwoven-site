/**
 * Shared constants used across client and server
 */

export const MAX_INTENTION_LENGTH = 250

// Timeout values (ms) for AI API calls
export const CHANNELING_TIMEOUT_MS = 30_000
export const SYNTHESIS_TIMEOUT_MS = 60_000
export const ANALYSIS_TIMEOUT_MS = 15_000
export const MODERATION_TIMEOUT_MS = 3_000

// Max tokens for AI model responses
export const CHANNELING_MAX_TOKENS = 3_000
export const SYNTHESIS_MAX_TOKENS = 4_000
export const ANALYSIS_MAX_TOKENS = 4_096
export const MODERATION_MAX_TOKENS = 256

// Disclaimers
export const DISCLAIMER_FULL =
  'Starwoven uses AI to generate responses for entertainment and personal reflection. It is not a substitute for professional advice \u2014 medical, legal, financial, or psychological.'
export const DISCLAIMER_BRIEF = 'AI-generated responses for entertainment and reflection only.'
