-- Run this once in the Supabase SQL editor, after PIPELINE_MIGRATION.sql.
--
-- Adds clock-anchored windows for opening/closing tasks: instead of the
-- window starting whenever the worker opens the task, it opens/auto-fails
-- at a fixed offset from the job's reporting_time (opening task) or
-- end_time (closing task). Middle 'task' rows are unaffected — they keep
-- the existing sequential relative-timer behavior (response_window_minutes/
-- auto_fail_minutes counted from when the task becomes available).
--
-- Safe to re-run: every statement is IF NOT EXISTS / idempotent.

ALTER TABLE job_tasks ADD COLUMN IF NOT EXISTS open_minutes_before integer NOT NULL DEFAULT 10;
ALTER TABLE job_tasks ADD COLUMN IF NOT EXISTS open_minutes_after integer NOT NULL DEFAULT 10;

NOTIFY pgrst, 'reload schema';
