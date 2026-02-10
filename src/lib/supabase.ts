/**
 * Supabase client and helpers
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js'

import type { MessageType, CoordinateSet, ModelResponse, ReadingMetadata } from './types'

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
 * Get readings for a session (for future reading history feature)
 */
export async function getSessionReadings(sessionId: string, limit = 10): Promise<ReadingRecord[]> {
  const client = getSupabaseClient()
  if (!client) {
    return []
  }

  try {
    const { data, error } = await client
      .from('readings')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Error fetching readings:', error)
      return []
    }

    return data as ReadingRecord[]
  } catch (err) {
    console.error('Error fetching readings:', err)
    return []
  }
}

/**
 * Get a single reading by ID
 */
export async function getReading(id: string): Promise<ReadingRecord | null> {
  const client = getSupabaseClient()
  if (!client) {
    return null
  }

  try {
    const { data, error } = await client.from('readings').select('*').eq('id', id).single()

    if (error) {
      console.error('Error fetching reading:', error)
      return null
    }

    return data as ReadingRecord
  } catch (err) {
    console.error('Error fetching reading:', err)
    return null
  }
}
