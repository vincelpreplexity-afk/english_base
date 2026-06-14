-- ============================================================
-- students.avatar_emoji — optional emoji avatar for a student
-- Added in app commit bfdf816; this migration backfills the schema record.
-- Idempotent: safe to run on the existing production DB.
-- ============================================================
alter table students
  add column if not exists avatar_emoji text;
