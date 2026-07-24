-- ============================================================
-- Run this in Supabase SQL editor (project: npvumnhdswjuymqgqzoi)
-- Adds all missing columns to the profiles table
-- ============================================================

-- Missing base columns
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS phone text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS bio text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS gender text CHECK (gender IN ('male', 'female', 'other'));
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS age integer;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS skills text[] DEFAULT '{}';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS languages text[] DEFAULT '{}';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS categories text[] DEFAULT '{}';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS company_name text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS completed_jobs integer NOT NULL DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS total_jobs_posted integer NOT NULL DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS review_count integer NOT NULL DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS total_earnings numeric(12,2) NOT NULL DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS attendance_rate numeric(5,2) NOT NULL DEFAULT 100;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- KYC columns
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS aadhaar_number text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS aadhaar_front_url text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS aadhaar_back_url text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS pan_number text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS pan_front_url text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS pan_back_url text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS selfie_url text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS kyc_status text NOT NULL DEFAULT 'not_started';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS kyc_submitted_at timestamptz;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS kyc_reviewed_at timestamptz;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS kyc_rejection_reason text;

-- Add kyc_status constraint (safe to re-run)
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_kyc_status_check;
ALTER TABLE profiles ADD CONSTRAINT profiles_kyc_status_check
  CHECK (kyc_status IN ('not_started', 'submitted', 'approved', 'rejected'));

-- Ensure role column allows 'admin'
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE profiles ADD CONSTRAINT profiles_role_check
  CHECK (role IN ('worker', 'employer', 'admin'));

-- Jobs table (safe to re-run)
CREATE TABLE IF NOT EXISTS jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employer_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title text NOT NULL DEFAULT '',
  category text NOT NULL DEFAULT '',
  category_emoji text DEFAULT '💼',
  description text DEFAULT '',
  date text NOT NULL DEFAULT '',
  reporting_time text DEFAULT '',
  end_time text DEFAULT '',
  location text DEFAULT '',
  address text DEFAULT '',
  lat double precision DEFAULT 19.076,
  lng double precision DEFAULT 72.877,
  workers_needed integer NOT NULL DEFAULT 1,
  workers_hired integer NOT NULL DEFAULT 0,
  pay_per_worker numeric(10,2) NOT NULL DEFAULT 0,
  food_provided boolean NOT NULL DEFAULT false,
  transport_provided boolean NOT NULL DEFAULT false,
  dress_code text DEFAULT 'Casual',
  languages_required text[] DEFAULT '{}',
  gender_preference text DEFAULT 'any' CHECK (gender_preference IN ('any', 'male', 'female')),
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('draft', 'active', 'completed', 'cancelled')),
  is_featured boolean NOT NULL DEFAULT false,
  is_urgent boolean NOT NULL DEFAULT false,
  applicants_count integer NOT NULL DEFAULT 0,
  location_lat double precision,
  location_lng double precision,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anyone can view active jobs" ON jobs;
DROP POLICY IF EXISTS "employers can insert own jobs" ON jobs;
DROP POLICY IF EXISTS "employers can update own jobs" ON jobs;
CREATE POLICY "anyone can view active jobs" ON jobs FOR SELECT USING (true);
CREATE POLICY "employers can insert own jobs" ON jobs FOR INSERT WITH CHECK (true);
CREATE POLICY "employers can update own jobs" ON jobs FOR UPDATE USING (true);

-- Applications table
CREATE TABLE IF NOT EXISTS applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id uuid NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  worker_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'applied' CHECK (status IN ('applied', 'shortlisted', 'hired', 'rejected', 'completed', 'no_show')),
  applied_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(job_id, worker_id)
);
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "workers see own applications" ON applications;
DROP POLICY IF EXISTS "workers can apply" ON applications;
DROP POLICY IF EXISTS "employers can update applications" ON applications;
CREATE POLICY "workers see own applications" ON applications FOR SELECT USING (true);
CREATE POLICY "workers can apply" ON applications FOR INSERT WITH CHECK (true);
CREATE POLICY "employers can update applications" ON applications FOR UPDATE USING (true);

-- Wallets table
CREATE TABLE IF NOT EXISTS wallets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
  balance numeric(12,2) NOT NULL DEFAULT 0,
  escrow_balance numeric(12,2) NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "users see own wallet" ON wallets;
CREATE POLICY "users see own wallet" ON wallets FOR SELECT USING (true);
CREATE POLICY "service can update wallet" ON wallets FOR UPDATE USING (true);
CREATE POLICY "service can insert wallet" ON wallets FOR INSERT WITH CHECK (true);

-- Auto-create wallet on new profile
CREATE OR REPLACE FUNCTION create_wallet_for_new_user()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  INSERT INTO wallets (user_id) VALUES (NEW.id) ON CONFLICT DO NOTHING;
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS on_profile_created ON profiles;
CREATE TRIGGER on_profile_created
  AFTER INSERT ON profiles
  FOR EACH ROW EXECUTE FUNCTION create_wallet_for_new_user();

-- Transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('credit', 'debit')),
  amount numeric(12,2) NOT NULL,
  description text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'success', 'failed')),
  razorpay_order_id text,
  razorpay_payment_id text,
  job_id uuid REFERENCES jobs(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "users see own transactions" ON transactions;
DROP POLICY IF EXISTS "service can insert transactions" ON transactions;
DROP POLICY IF EXISTS "service can update transactions" ON transactions;
CREATE POLICY "users see own transactions" ON transactions FOR SELECT USING (true);
CREATE POLICY "service can insert transactions" ON transactions FOR INSERT WITH CHECK (true);
CREATE POLICY "service can update transactions" ON transactions FOR UPDATE USING (true);

-- Worker locations table
CREATE TABLE IF NOT EXISTS worker_locations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  worker_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  job_id uuid NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  lat double precision NOT NULL,
  lng double precision NOT NULL,
  accuracy double precision,
  updated_at timestamptz DEFAULT now(),
  UNIQUE(worker_id, job_id)
);
ALTER TABLE worker_locations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "workers update own location" ON worker_locations;
DROP POLICY IF EXISTS "employers view job locations" ON worker_locations;
CREATE POLICY "workers update own location" ON worker_locations FOR ALL USING (true);
CREATE POLICY "employers view job locations" ON worker_locations FOR SELECT USING (true);

-- KYC documents table
CREATE TABLE IF NOT EXISTS kyc_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
  type text NOT NULL DEFAULT 'identity' CHECK (type IN ('identity')),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  full_name text NOT NULL DEFAULT '',
  city text NOT NULL DEFAULT '',
  area text NOT NULL DEFAULT '',
  company_name text,
  aadhaar_number text,
  front_url text,
  back_url text,
  pan_number text,
  pan_front_url text,
  pan_back_url text,
  selfie_url text,
  rejection_reason text,
  submitted_at timestamptz NOT NULL DEFAULT now(),
  reviewed_at timestamptz
);
ALTER TABLE kyc_documents ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "service reads kyc docs" ON kyc_documents;
DROP POLICY IF EXISTS "service inserts kyc docs" ON kyc_documents;
DROP POLICY IF EXISTS "service updates kyc docs" ON kyc_documents;
CREATE POLICY "service reads kyc docs" ON kyc_documents FOR SELECT USING (true);
CREATE POLICY "service inserts kyc docs" ON kyc_documents FOR INSERT WITH CHECK (true);
CREATE POLICY "service updates kyc docs" ON kyc_documents FOR UPDATE USING (true);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type text NOT NULL DEFAULT 'general',
  title text NOT NULL DEFAULT '',
  message text NOT NULL DEFAULT '',
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "users see own notifications" ON notifications;
DROP POLICY IF EXISTS "service inserts notifications" ON notifications;
CREATE POLICY "users see own notifications" ON notifications FOR SELECT USING (true);
CREATE POLICY "service inserts notifications" ON notifications FOR INSERT WITH CHECK (true);
CREATE POLICY "service updates notifications" ON notifications FOR UPDATE USING (true);

-- Increment wallet balance RPC
CREATE OR REPLACE FUNCTION increment_wallet_balance(p_user_id uuid, p_amount numeric)
RETURNS void LANGUAGE plpgsql AS $$
BEGIN
  UPDATE wallets
  SET balance = balance + p_amount, updated_at = now()
  WHERE user_id = p_user_id;
END;
$$;
