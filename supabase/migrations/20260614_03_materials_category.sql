-- ============================================================
-- materials.category — free-text category/folder for a material
-- Added in app commit bfdf816; this migration backfills the schema record.
-- Idempotent: safe to run on the existing production DB.
-- ============================================================
alter table materials
  add column if not exists category text;
