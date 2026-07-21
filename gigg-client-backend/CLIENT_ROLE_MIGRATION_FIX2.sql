-- Run this once in the Supabase SQL editor. Follow-up to
-- CLIENT_ROLE_MIGRATION_FIX.sql, which fixed the profiles.role enum type
-- but missed a SEPARATE check constraint on the same column:
-- "profiles_role_check", which still only allows the old role values.
-- Verified live: inviting a client fails with
-- "new row for relation \"profiles\" violates check constraint
-- \"profiles_role_check\"" even though the user_role enum already has
-- 'client' as a valid value — Postgres enforces both independently.
--
-- Safe to re-run.

ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE profiles ADD CONSTRAINT profiles_role_check
  CHECK (role::text IN ('worker', 'employer', 'admin', 'client'));

NOTIFY pgrst, 'reload schema';
