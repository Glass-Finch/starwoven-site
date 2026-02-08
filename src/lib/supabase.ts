/**
 * Supabase client and helpers
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js'
import type { MessageType, CoordinateSet, ModelResponse } from './types'

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
  metadata?: Record<string, unknown>
}

export interface ReadingInsert {
  session_id: string
  message_type: MessageType
  intention: string
  coordinates: CoordinateSet
  synthesis: string
  threads: ModelResponse[]
  metadata?: Record<string, unknown>
}

// Environment validation
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase environment variables not configured')
}

// Create client (works on both client and server)
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

/**
 * Save a completed reading to the database
 */
export async function saveReading(reading: ReadingInsert): Promise<{ id: string } | null> {
  const client = getSupabaseClient()
  if (!client) {
    console.warn('Supabase not configured, skipping save')
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
export async function getSessionReadings(
  sessionId: string,
  limit = 10
): Promise<ReadingRecord[]> {
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
    const { data, error } = await client
      .from('readings')
      .select('*')
      .eq('id', id)
      .single()

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
