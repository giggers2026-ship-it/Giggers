-- ============================================================
-- Run this in Supabase SQL editor (project: npvumnhdswjuymqgqzoi)
-- ============================================================

-- 1. Wallets table
CREATE TABLE IF NOT EXISTS wallets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
  balance numeric(12,2) NOT NULL DEFAULT 0,
  escrow_balance numeric(12,2) NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users see own wallet" ON wallets FOR SELECT USING (auth.uid() = user_id);

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

-- 2. Transactions table (already partially exists — extend if needed)
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
CREATE POLICY "users see own transactions" ON transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "service can insert transactions" ON transactions FOR INSERT WITH CHECK (true);
CREATE POLICY "service can update transactions" ON transactions FOR UPDATE USING (true);

-- 3. Worker locations table (for real-time GPS tracking)
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
-- Workers can update their own location; employers who own the job can read
CREATE POLICY "workers update own location" ON worker_locations
  FOR ALL USING (auth.uid() = worker_id);
CREATE POLICY "employers view job locations" ON worker_locations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM jobs j WHERE j.id = job_id AND j.employer_id = auth.uid()
    )
  );

-- 4. Increment wallet balance RPC (called after payment verification)
CREATE OR REPLACE FUNCTION increment_wallet_balance(p_user_id uuid, p_amount numeric)
RETURNS void LANGUAGE plpgsql AS $$
BEGIN
  UPDATE wallets
  SET balance = balance + p_amount, updated_at = now()
  WHERE user_id = p_user_id;
END;
$$;

-- 5. Add location columns to jobs table if not exists
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS location_lat double precision;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS location_lng double precision;
