-- Adds credit_point counter, one-liner, and worker payout-detail fields to profiles.
-- Per user decision: credit_point is a simple integer counter, no ledger/audit table.
-- Run manually in the Supabase SQL editor (no migration runner in this repo).

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS credit_point integer NOT NULL DEFAULT 100;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS one_liner text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS upi_id text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS bank_account text;

COMMENT ON COLUMN profiles.credit_point IS 'Simple integer counter, decremented as a penalty (e.g. last-hour job edits). No ledger/history table by design.';
COMMENT ON COLUMN profiles.one_liner IS 'Short one-line profile tagline, distinct from the longer bio field.';
COMMENT ON COLUMN profiles.upi_id IS 'Worker payout UPI ID, optional.';
COMMENT ON COLUMN profiles.bank_account IS 'Worker payout bank account number, optional, free-text.';

-- Atomic decrement, floors at 0 so repeated penalties can't go negative.
CREATE OR REPLACE FUNCTION decrement_credit_point(p_user_id uuid, p_amount integer)
RETURNS void
LANGUAGE sql
AS $$
  UPDATE profiles
  SET credit_point = GREATEST(0, credit_point - p_amount)
  WHERE id = p_user_id;
$$;
