-- Adds the 'confirmed' status: the worker-side hire-confirmation step.
-- Flow becomes: applied -> hired (employer offered) -> confirmed (worker accepted)
--                                                     -> rejected (worker declined)
-- 'hired' is retained as the "employer has offered, awaiting worker response" state;
-- 'confirmed' is the new "fully active, worker accepted" state that replaces what
-- 'hired' used to mean everywhere in the frontend.
--
-- Must run as its own statement/file — ALTER TYPE ... ADD VALUE cannot run in the
-- same transaction as other DDL (same constraint documented in
-- FIX_APPLICATION_STATUS_ENUM.sql).

ALTER TYPE application_status ADD VALUE IF NOT EXISTS 'confirmed';
