-- Run this once in the Supabase SQL editor.
--
-- Phase 3 of the custom-pipeline build: adds a read-only "Client" role
-- (e.g. a wedding client who wants to watch their job's pipeline progress
-- live) scoped per-job via employer invites. Clients access their view via
-- a magic link (invite_token), no OTP/password needed for a one-off viewer.
--
-- Safe to re-run: every statement is IF NOT EXISTS / idempotent.

ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE profiles ADD CONSTRAINT profiles_role_check
  CHECK (role IN ('worker', 'employer', 'admin', 'client'));

CREATE TABLE IF NOT EXISTS job_clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id uuid NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  employer_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name text NOT NULL DEFAULT '',
  phone text NOT NULL,
  invite_token text UNIQUE,
  invited_at timestamptz DEFAULT now(),
  last_viewed_at timestamptz,
  UNIQUE(job_id, phone)
);
ALTER TABLE job_clients ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anyone can read job clients" ON job_clients;
DROP POLICY IF EXISTS "service can write job clients" ON job_clients;
CREATE POLICY "anyone can read job clients" ON job_clients FOR SELECT USING (true);
CREATE POLICY "service can write job clients" ON job_clients FOR ALL USING (true) WITH CHECK (true);

NOTIFY pgrst, 'reload schema';
