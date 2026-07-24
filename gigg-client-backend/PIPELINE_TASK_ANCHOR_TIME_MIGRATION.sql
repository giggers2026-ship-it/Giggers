-- Run this once in the Supabase SQL editor, after PIPELINE_EMPLOYER_OVERRIDE_MIGRATION.sql.
--
-- Lets the employer give a middle 'task' row its own clock-anchored window
-- (e.g. "Started the job" at 5:00 PM ± 10 min), same mechanism opening/closing
-- tasks already use, instead of only the relative timer (response_window_minutes/
-- auto_fail_minutes counted from whenever the task becomes available).
--
-- anchor_time: 'HH:MM' text, same format as jobs.reporting_time / jobs.end_time.
-- NULL means the task keeps the old relative-timer behavior (backward
-- compatible — existing middle tasks are unaffected until an employer
-- explicitly sets a time on them).
--
-- Safe to re-run: every statement is IF NOT EXISTS / idempotent.

ALTER TABLE job_tasks ADD COLUMN IF NOT EXISTS anchor_time text;

NOTIFY pgrst, 'reload schema';
