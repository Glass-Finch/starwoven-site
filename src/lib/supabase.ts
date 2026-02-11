/**
 * Supabase client and helpers
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js'

import type { MessageType, CoordinateSet, ModelResponse, ReadingMetadata } from './types'
import type { CostBreakdown } from './cost'

// Types for database records
export interface ReadingRecord {
  id: string
  created_at: string
  session_id: string
  message_type: MessageType
  intention: string
  coordinates: CoordinateSet
  synthesis: string
  threads: ModelResponse[]
  metadata?: ReadingMetadata
}

export interface ReadingInsert {
  session_id: string
  message_type: MessageType
  intention: string
  coordinates: CoordinateSet
  synthesis: string
  threads: ModelResponse[]
  metadata?: ReadingMetadata
}

// Environment validation
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase environment variables not configured')
}

// Client-side Supabase client (uses anon key, respects RLS)
let supabase: SupabaseClient | null = null

export function getSupabaseClient(): SupabaseClient | null {
  if (!supabaseUrl || !supabaseAnonKey) {
    return null
  }

  if (!supabase) {
    supabase = createClient(supabaseUrl, supabaseAnonKey)
  }

  return supabase
}

// Server-side Supabase client (uses service role key, bypasses RLS)
let serverSupabase: SupabaseClient | null = null

export function getServerSupabaseClient(): SupabaseClient | null {
  if (!supabaseUrl || !supabaseServiceRoleKey) {
    return null
  }

  if (!serverSupabase) {
    serverSupabase = createClient(supabaseUrl, supabaseServiceRoleKey)
  }

  return serverSupabase
}

/**
 * Save a completed reading to the database (server-side, bypasses RLS)
 */
export async function saveReadingServerSide(
  reading: ReadingInsert
): Promise<{ id: string } | null> {
  const client = getServerSupabaseClient()
  if (!client) {
    console.warn('Server Supabase not configured, skipping save')
    return null
  }

  try {
    const { data, error } = await client
      .from('readings')
      .insert({
        session_id: reading.session_id,
        message_type: reading.message_type,
        intention: reading.intention,
        coordinates: reading.coordinates,
        synthesis: reading.synthesis,
        threads: reading.threads,
        metadata: reading.metadata || {},
      })
      .select('id')
      .single()

    if (error) {
      console.error('Error saving reading:', error)
      return null
    }

    return { id: data.id }
  } catch (err) {
    console.error('Error saving reading:', err)
    return null
  }
}

/**
 * Save cost tracking data to dedicated table (server-side, fire and forget)
 */
export async function saveCostTracking(
  breakdown: CostBreakdown,
  readingId?: string | null
): Promise<void> {
  const client = getServerSupabaseClient()
  if (!client) return

  try {
    const { error } = await client.from('cost_tracking').insert({
      reading_id: readingId || null,
      session_id: breakdown.sessionId,
      moderation_input_tokens: breakdown.moderation?.inputTokens ?? 0,
      moderation_output_tokens: breakdown.moderation?.outputTokens ?? 0,
      moderation_cost_usd: breakdown.moderation?.costUSD ?? 0,
      channeling_input_tokens: breakdown.channeling.inputTokens,
      channeling_output_tokens: breakdown.channeling.outputTokens,
      channeling_cost_usd: breakdown.channeling.costUSD,
      review_input_tokens: breakdown.review?.inputTokens ?? 0,
      review_output_tokens: breakdown.review?.outputTokens ?? 0,
      review_cost_usd: breakdown.review?.costUSD ?? 0,
      synthesis_input_tokens: breakdown.synthesis?.inputTokens ?? 0,
      synthesis_output_tokens: breakdown.synthesis?.outputTokens ?? 0,
      synthesis_cost_usd: breakdown.synthesis?.costUSD ?? 0,
      total_tokens: breakdown.totalTokens,
      total_cost_usd: breakdown.estimatedCostUSD,
      per_model: breakdown.perModel,
    })

    if (error) {
      console.error('Error saving cost tracking:', error)
    }
  } catch (err) {
    console.error('Error saving cost tracking:', err)
  }
}

// Coordinate mappings types and cache
export interface CoordinateMapping {
  questionId: string
  values: number[]
  meanings: string[]
  source: string
}

let mappingsCache: Map<string, CoordinateMapping> | null = null

/**
 * Fetch all coordinate mappings from Supabase (client-side, cached in memory).
 * Returns a Map keyed by question_id. Returns empty map if Supabase is unavailable.
 */
export async function fetchCoordinateMappings(): Promise<Map<string, CoordinateMapping>> {
  if (mappingsCache) return mappingsCache

  const client = getSupabaseClient()
  if (!client) {
    return new Map()
  }

  try {
    const { data, error } = await client
      .from('coordinate_mappings')
      .select('question_id, option_values, option_meanings, source')

    if (error) {
      console.error('Error fetching coordinate mappings:', error)
      return new Map()
    }

    const map = new Map<string, CoordinateMapping>()
    for (const row of data) {
      map.set(row.question_id, {
        questionId: row.question_id,
        values: row.option_values as number[],
        meanings: row.option_meanings as string[],
        source: row.source as string,
      })
    }

    mappingsCache = map
    return map
  } catch (err) {
    console.error('Error fetching coordinate mappings:', err)
    return new Map()
  }
}
