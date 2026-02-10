-- Tighten RLS: Remove permissive INSERT policy
-- Server-side writes now use the service role key (bypasses RLS entirely).
-- The old policy allowed anyone with the anon key to insert arbitrary data.

DROP POLICY IF EXISTS "insert_readings" ON readings;

-- SELECT and UPDATE policies remain — they correctly scope reads/updates
-- to the session owner via x-session-id header.
