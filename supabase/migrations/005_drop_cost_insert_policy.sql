-- Remove overly permissive INSERT policy on cost_tracking.
-- Service role bypasses RLS and can still insert.
-- This prevents anonymous clients from polluting cost data.
DROP POLICY IF EXISTS "insert_cost_tracking" ON cost_tracking;
