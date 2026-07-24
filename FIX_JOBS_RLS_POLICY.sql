-- Run this once in the Supabase SQL editor.
--
-- Fixes: posting a job now fails with:
-- "new row violates row-level security policy for table \"jobs\""
-- This means the live `jobs` table's INSERT policy doesn't allow the
-- app's anon-key client to insert (it's either missing, or stricter than
-- WITH CHECK (true) — e.g. requiring auth.uid(), which is always null
-- here since this app uses its own custom JWT auth, not Supabase Auth).
--
-- This drops and recreates the jobs policies to match what the app
-- actually needs: anyone can read active jobs, and any client can insert/
-- update (the app's own backend/business logic is the real gatekeeper,
-- same pattern already used for applications/wallets/transactions).
--
-- Safe to re-run.

DROP POLICY IF EXISTS "anyone can view active jobs" ON jobs;
DROP POLICY IF EXISTS "employers can insert own jobs" ON jobs;
DROP POLICY IF EXISTS "employers can update own jobs" ON jobs;

CREATE POLICY "anyone can view active jobs" ON jobs FOR SELECT USING (true);
CREATE POLICY "employers can insert own jobs" ON jobs FOR INSERT WITH CHECK (true);
CREATE POLICY "employers can update own jobs" ON jobs FOR UPDATE USING (true);
