-- Run this once in the Supabase SQL editor. Replaces CLIENT_ROLE_MIGRATION.sql,
-- which failed silently: profiles.role is a native Postgres ENUM type
-- (public.user_role), not a text column with a CHECK constraint, so the
-- original migration's `ALTER TABLE profiles ADD CONSTRAINT ... CHECK (role
-- IN (...))` was invalid against an enum column and aborted before
-- `job_clients` was ever created. Verified live: job_clients does not exist,
-- profiles.role enum is still ('worker','employer','admin') with no 'client'.
--
-- This adds the enum value the correct way (ALTER TYPE ... ADD VALUE) and
-- (re)creates job_clients. Safe to re-run except the ALTER TYPE line, which
-- Postgres will error on with "already exists" if run twice — that error is
-- harmless, just re-run the rest of the file if you hit it.

ALTER TYPE public.user_role ADD VALUE IF NOT EXISTS 'client';

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
