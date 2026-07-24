-- Run this once in the Supabase SQL editor.
--
-- Root cause: the live `jobs` table was built from an older schema design
-- (slots_total, starts_at/ends_at, no address/lat/lng/dress_code/etc.)
-- while the app code (jobStore.ts postJob) and reference SQL files
-- (SUPABASE_SQL.sql, MIGRATION_FIX.sql) were written against a newer
-- design (workers_needed, date/reporting_time/end_time, address, lat/lng,
-- dress_code, languages_required, gender_preference, applicants_count).
-- That mismatch is why every job post failed with "Could not find the
-- 'address' column of 'jobs' in the schema cache" even after the
-- FIX_MISSING_JOB_COLUMNS.sql migration added 7 other missing columns.
--
-- This adds every column the app code actually reads/writes, without
-- touching or removing the existing legacy columns (slots_total,
-- starts_at, ends_at) — they're just left unused.
--
-- Also fixes `transactions`, which is missing razorpay_order_id /
-- razorpay_payment_id that payment.controller.ts needs for the wallet
-- top-up verify flow (createOrder / verifyPayment / webhook handlers).
--
-- Safe to re-run: every statement is IF NOT EXISTS / idempotent.

ALTER TABLE jobs ADD COLUMN IF NOT EXISTS category_emoji text DEFAULT '💼';
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS date text DEFAULT '';
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS reporting_time text DEFAULT '';
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS end_time text DEFAULT '';
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS address text DEFAULT '';
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS lat double precision DEFAULT 19.076;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS lng double precision DEFAULT 72.877;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS workers_needed integer NOT NULL DEFAULT 1;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS workers_hired integer NOT NULL DEFAULT 0;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS food_provided boolean NOT NULL DEFAULT false;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS transport_provided boolean NOT NULL DEFAULT false;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS dress_code text DEFAULT 'Casual';
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS languages_required text[] DEFAULT '{}';
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS gender_preference text DEFAULT 'any';
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS applicants_count integer NOT NULL DEFAULT 0;

ALTER TABLE transactions ADD COLUMN IF NOT EXISTS razorpay_order_id text;
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS razorpay_payment_id text;

ALTER TABLE kyc_documents ADD COLUMN IF NOT EXISTS city text NOT NULL DEFAULT '';
ALTER TABLE kyc_documents ADD COLUMN IF NOT EXISTS area text NOT NULL DEFAULT '';

-- Force PostgREST to pick up the new columns immediately instead of
-- waiting for its next schema-cache refresh interval.
NOTIFY pgrst, 'reload schema';
