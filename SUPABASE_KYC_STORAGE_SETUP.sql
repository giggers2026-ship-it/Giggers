-- Run this once in the Supabase SQL editor to set up KYC document storage.
-- Fixes: KYC images (Aadhaar/PAN/selfie) were being stored as base64 text
-- directly in the `profiles` / `kyc_documents` columns, which bloated API
-- responses and blew the browser's localStorage quota on login. The backend
-- now uploads these images to this bucket and stores only the resulting path,
-- serving them via short-lived signed URLs (these are sensitive ID documents,
-- so the bucket is private — no public or anon/authenticated read access).

-- 1. Create the bucket (private).
insert into storage.buckets (id, name, public)
values ('kyc-documents', 'kyc-documents', false)
on conflict (id) do update set public = false;

-- No RLS policies for anon/authenticated roles: only the backend's
-- service-role key (which bypasses RLS) can upload or read KYC documents.
-- The backend generates short-lived signed URLs on demand for admin review.
