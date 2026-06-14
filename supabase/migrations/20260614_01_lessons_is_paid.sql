-- ============================================================
-- lessons.is_paid — payment tracking per lesson
-- Added in app commit e916c47; this migration backfills the schema record.
-- Idempotent: safe to run on the existing production DB.
-- ============================================================
alter table lessons
  add column if not exists is_paid boolean not null default false;
