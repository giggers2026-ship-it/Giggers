-- Run this if KYC submission fails with:
-- "Could not find the 'area' column of 'kyc_documents' in the schema cache"
-- This means your kyc_documents table predates the `area` column being added
-- to SUPABASE_SQL.sql, so it's missing from the live table.

ALTER TABLE kyc_documents ADD COLUMN IF NOT EXISTS area text NOT NULL DEFAULT '';

-- If the error persists after adding the column, Supabase's PostgREST schema
-- cache may just be stale — force it to reload:
NOTIFY pgrst, 'reload schema';
