-- ============================================================
-- material_categories — registry of material categories and their folder icon
-- Added in app commit bfdf816; this migration backfills the schema record.
-- Idempotent: safe to run on the existing production DB.
-- ============================================================
create table if not exists material_categories (
  id   uuid primary key default gen_random_uuid(),
  name text not null unique,
  icon text not null default 'BookOpen'
);

alter table material_categories enable row level security;
-- No policies → only SUPABASE_SECRET_KEY (service role) can read/write.
