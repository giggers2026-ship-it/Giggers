-- Run this once in the Supabase SQL editor, after PIPELINE_CLOCK_WINDOW_MIGRATION.sql.
--
-- Supports the employer emergency-override flow: force-completing a single
-- worker's task, or reopening a failed/missed task with a fresh window.
--
-- manually_reopened_at: set when an employer reopens a clock-anchored
-- (opening/closing) task. Once set, that completion's deadline is computed
-- as manually_reopened_at + open_minutes_after instead of the job's fixed
-- clock-anchor deadline — otherwise a reopened task whose original job-clock
-- deadline has already passed would just get auto-failed again on the next
-- read. Relative-timer 'task' rows don't need this: reopening them already
-- resets available_at, which is what their deadline is computed from.
--
-- Safe to re-run: every statement is IF NOT EXISTS / idempotent.

ALTER TABLE application_task_completions ADD COLUMN IF NOT EXISTS manually_reopened_at timestamptz;

NOTIFY pgrst, 'reload schema';
