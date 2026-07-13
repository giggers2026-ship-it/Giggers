-- V2 Migration for Giggers Workflow updates
-- Run this in your Supabase SQL Editor (project: npvumnhdswjuymqgqzoi)

-- 1. Add new fields to jobs table
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS need_location_based_workers boolean DEFAULT false;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS nature_of_work text DEFAULT '';
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS client_name text DEFAULT '';
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS client_id text DEFAULT '';
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS mode_of_payment text DEFAULT 'Online';
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS payment_date text DEFAULT '';
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS dos_and_donts text DEFAULT '';

-- 2. Add pipeline tracking fields to applications table
ALTER TABLE applications ADD COLUMN IF NOT EXISTS reporting_completed boolean DEFAULT false;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS selfie_completed boolean DEFAULT false;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS tshirt_completed boolean DEFAULT false;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS shoes_completed boolean DEFAULT false;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS pipeline_status text DEFAULT 'pending';

-- Note: The status 'hired' is already in the check constraint for applications.
-- Make sure the app uses 'hired' instead of 'accepted' (this frontend change has been made).
