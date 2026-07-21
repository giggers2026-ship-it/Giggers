-- Run this once in the Supabase SQL editor.
--
-- Phase 1 of the custom-pipeline build: adds job_tasks (employer-defined
-- per-job task list: Opening Task, Task 1..N, Closing Task) and
-- application_task_completions (per-worker per-task status), replacing the
-- old hardcoded 4-step pipeline (reporting/selfie/tshirt/shoes booleans on
-- applications). The old columns are left in place during the transition —
-- do not drop them yet (see PIPELINE_MIGRATION_CUTOVER.sql, run later once
-- all in-flight jobs have been migrated to the new tables).
--
-- Safe to re-run: every statement is IF NOT EXISTS / idempotent.

CREATE TABLE IF NOT EXISTS job_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id uuid NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  kind text NOT NULL CHECK (kind IN ('opening', 'task', 'closing')),
  sort_order integer NOT NULL DEFAULT 0,
  title text NOT NULL DEFAULT '',
  description text DEFAULT '',
  completion_type text NOT NULL CHECK (completion_type IN ('image', 'form', 'tick')),
  form_schema jsonb,
  response_window_minutes integer NOT NULL DEFAULT 5,
  auto_fail_minutes integer NOT NULL DEFAULT 10,
  requires_review boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE job_tasks ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anyone can read job tasks" ON job_tasks;
DROP POLICY IF EXISTS "service can write job tasks" ON job_tasks;
CREATE POLICY "anyone can read job tasks" ON job_tasks FOR SELECT USING (true);
CREATE POLICY "service can write job tasks" ON job_tasks FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS application_task_completions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id uuid NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  job_task_id uuid NOT NULL REFERENCES job_tasks(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'submitted', 'complete', 'failed')),
  image_path text,
  form_data jsonb,
  available_at timestamptz,
  submitted_at timestamptz,
  reviewed_at timestamptz,
  reviewed_by uuid REFERENCES profiles(id),
  rejection_reason text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(application_id, job_task_id)
);
ALTER TABLE application_task_completions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anyone can read task completions" ON application_task_completions;
DROP POLICY IF EXISTS "service can write task completions" ON application_task_completions;
CREATE POLICY "anyone can read task completions" ON application_task_completions FOR SELECT USING (true);
CREATE POLICY "service can write task completions" ON application_task_completions FOR ALL USING (true) WITH CHECK (true);

-- Private bucket for task-completion images (separate from kyc-documents,
-- since these are job-operational photos, not identity documents).
insert into storage.buckets (id, name, public)
values ('pipeline-task-images', 'pipeline-task-images', false)
on conflict (id) do update set public = false;

NOTIFY pgrst, 'reload schema';
