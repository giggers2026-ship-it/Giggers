-- Run this once in the Supabase SQL editor.
--
-- Phase 4 of the custom-pipeline build: adds video-recording support to
-- chat_messages, tied to a specific pipeline task, and a private storage
-- bucket for the recordings themselves. Recordings are uploaded directly
-- from the browser to Supabase Storage using a pre-signed upload URL (not
-- routed through the Express backend as base64/JSON — video files are too
-- large for that pattern), then registered as a chat_messages row.
--
-- Safe to re-run: every statement is IF NOT EXISTS / idempotent.

ALTER TABLE chat_messages ADD COLUMN IF NOT EXISTS video_path text;
ALTER TABLE chat_messages ADD COLUMN IF NOT EXISTS video_duration_seconds integer;
ALTER TABLE chat_messages ADD COLUMN IF NOT EXISTS job_task_id uuid REFERENCES job_tasks(id) ON DELETE SET NULL;

-- Widen the type check constraint (if one exists) to allow 'video'. This is
-- a no-op if chat_messages.type has no CHECK constraint today (likely, since
-- the table predates any checked-in migration).
DO $$
BEGIN
  ALTER TABLE chat_messages DROP CONSTRAINT IF EXISTS chat_messages_type_check;
  ALTER TABLE chat_messages ADD CONSTRAINT chat_messages_type_check
    CHECK (type IN ('text', 'image', 'file', 'voice', 'video'));
EXCEPTION WHEN others THEN
  NULL; -- ignore if the column has values outside this set already
END $$;

-- Private bucket for job/task recordings.
insert into storage.buckets (id, name, public)
values ('job-recordings', 'job-recordings', false)
on conflict (id) do update set public = false;

NOTIFY pgrst, 'reload schema';
