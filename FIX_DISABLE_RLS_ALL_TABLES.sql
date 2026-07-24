-- Disables Row Level Security across all app tables.
--
-- Why: the frontend authenticates via a custom Express-issued JWT, not
-- Supabase Auth — so auth.uid() is always NULL for every request the
-- browser makes with the anon key. RLS policies that check auth.uid()
-- (or that default-deny with RLS enabled and no matching policy) were
-- silently rejecting real user writes on several tables (confirmed via
-- direct reproduction: applications, notifications, chat_threads,
-- wallets all returned 42501 "row-level security policy" violations on
-- insert from the anon-key client, while jobs/job_tasks happened to
-- allow it). Every write in the frontend swallows or half-handles the
-- resulting Supabase error, so the UI showed false-success toasts while
-- nothing was actually persisted.
--
-- Access control for this app lives in the Express backends (JWT auth
-- + role checks), not in Postgres RLS, so RLS is turned off everywhere
-- rather than patched table-by-table.

ALTER TABLE public.notifications DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.worker_locations DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.kyc_documents DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_clients DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.application_task_completions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallets DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_settings DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_threads DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_tasks DISABLE ROW LEVEL SECURITY;
