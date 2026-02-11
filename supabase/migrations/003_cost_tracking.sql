-- Cost tracking table for per-reading API usage and cost data
-- Queryable alternative to the metadata.cost JSON blob in readings

CREATE TABLE IF NOT EXISTS cost_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reading_id UUID REFERENCES readings(id) ON DELETE CASCADE,
  session_id TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Per-stage token counts
  moderation_input_tokens INT DEFAULT 0,
  moderation_output_tokens INT DEFAULT 0,
  moderation_cost_usd NUMERIC(10, 6) DEFAULT 0,

  channeling_input_tokens INT DEFAULT 0,
  channeling_output_tokens INT DEFAULT 0,
  channeling_cost_usd NUMERIC(10, 6) DEFAULT 0,

  review_input_tokens INT DEFAULT 0,
  review_output_tokens INT DEFAULT 0,
  review_cost_usd NUMERIC(10, 6) DEFAULT 0,

  synthesis_input_tokens INT DEFAULT 0,
  synthesis_output_tokens INT DEFAULT 0,
  synthesis_cost_usd NUMERIC(10, 6) DEFAULT 0,

  -- Totals
  total_tokens INT DEFAULT 0,
  total_cost_usd NUMERIC(10, 6) DEFAULT 0,

  -- Per-oracle breakdown (for detailed analysis)
  per_model JSONB
);

-- Index for cost aggregation queries
CREATE INDEX IF NOT EXISTS idx_cost_tracking_created
  ON cost_tracking(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_cost_tracking_session
  ON cost_tracking(session_id);

-- Enable RLS
ALTER TABLE cost_tracking ENABLE ROW LEVEL SECURITY;

-- Policy: service role can insert (server-side only)
CREATE POLICY "insert_cost_tracking" ON cost_tracking
  FOR INSERT
  WITH CHECK (true);

-- Policy: service role can read all (for admin queries)
CREATE POLICY "read_cost_tracking" ON cost_tracking
  FOR SELECT
  USING (true);
