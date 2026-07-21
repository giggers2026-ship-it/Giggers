-- Run this once in the Supabase SQL editor.
-- Fixes: posting a job silently failed with no error shown to the user.
-- Root cause: postJob() in jobStore.ts inserts into the `jobs` table with
-- columns (need_location_based_workers, nature_of_work, client_name,
-- client_id, mode_of_payment, payment_date, dos_and_donts) that were added
-- to the app's code but never added to the live database — so every insert
-- was rejected by PostgREST with "Could not find the 'X' column of 'jobs'
-- in the schema cache", and the frontend swallowed the error silently.
--
-- Also adds the applications pipeline-tracking columns the code expects
-- (reporting_completed, selfie_completed, tshirt_completed, shoes_completed,
-- pipeline_status) which were in the same gap.
--
-- Safe to re-run: every statement is IF NOT EXISTS / idempotent.

ALTER TABLE jobs ADD COLUMN IF NOT EXISTS need_location_based_workers boolean DEFAULT false;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS nature_of_work text DEFAULT '';
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS client_name text DEFAULT '';
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS client_id text DEFAULT '';
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS mode_of_payment text DEFAULT 'Online';
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS payment_date text DEFAULT '';
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS dos_and_donts text DEFAULT '';

ALTER TABLE applications ADD COLUMN IF NOT EXISTS reporting_completed boolean DEFAULT false;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS selfie_completed boolean DEFAULT false;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS tshirt_completed boolean DEFAULT false;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS shoes_completed boolean DEFAULT false;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS pipeline_status text DEFAULT 'pending';

-- Force PostgREST to pick up the new columns immediately instead of
-- waiting for its next schema-cache refresh interval.
NOTIFY pgrst, 'reload schema';
