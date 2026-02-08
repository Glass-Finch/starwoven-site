-- Starwoven Database Schema
-- Single table design for MVP simplicity

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Readings table (stores everything as JSONB for flexibility)
CREATE TABLE IF NOT EXISTS readings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  session_id TEXT NOT NULL,              -- Anonymous session token from localStorage
  message_type TEXT NOT NULL,            -- love_interest, deceased_loved_one, etc.
  intention TEXT NOT NULL,               -- User's question
  coordinates JSONB NOT NULL,            -- { raw, questions, answers }
  synthesis TEXT NOT NULL,               -- Woven message from Opus
  threads JSONB NOT NULL,                -- Array of model responses
  metadata JSONB                         -- Future extensibility
);

-- Index for fetching user's readings by session
CREATE INDEX IF NOT EXISTS idx_readings_session
  ON readings(session_id, created_at DESC);

-- Index for analytics queries
CREATE INDEX IF NOT EXISTS idx_readings_message_type
  ON readings(message_type);

-- Enable Row Level Security
ALTER TABLE readings ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can insert readings
CREATE POLICY "insert_readings" ON readings
  FOR INSERT
  WITH CHECK (true);

-- Policy: Read own session's readings
-- Note: session_id is passed via request headers and set in Supabase client
CREATE POLICY "read_own_readings" ON readings
  FOR SELECT
  USING (session_id = current_setting('request.headers', true)::json->>'x-session-id');

-- Policy: Update own session's readings (for adding metadata later)
CREATE POLICY "update_own_readings" ON readings
  FOR UPDATE
  USING (session_id = current_setting('request.headers', true)::json->>'x-session-id');

-- Function to get reading count by message type (for analytics)
CREATE OR REPLACE FUNCTION get_reading_stats()
RETURNS TABLE (
  message_type TEXT,
  count BIGINT,
  last_reading TIMESTAMPTZ
)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT
    message_type,
    COUNT(*) as count,
    MAX(created_at) as last_reading
  FROM readings
  GROUP BY message_type
  ORDER BY count DESC;
$$;
