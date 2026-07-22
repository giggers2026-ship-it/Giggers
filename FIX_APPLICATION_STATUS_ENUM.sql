-- Widen the application_status enum to include the values the frontend
-- actually writes (applied/shortlisted/hired/completed/no_show), on top
-- of the original pending/accepted/rejected/withdrawn.
-- Postgres requires each ADD VALUE to run outside a transaction block
-- and (pre-12) outside the same transaction it's used in, so run these
-- statements one at a time / non-transactionally.

ALTER TYPE application_status ADD VALUE IF NOT EXISTS 'applied';
ALTER TYPE application_status ADD VALUE IF NOT EXISTS 'shortlisted';
ALTER TYPE application_status ADD VALUE IF NOT EXISTS 'hired';
ALTER TYPE application_status ADD VALUE IF NOT EXISTS 'completed';
ALTER TYPE application_status ADD VALUE IF NOT EXISTS 'no_show';
