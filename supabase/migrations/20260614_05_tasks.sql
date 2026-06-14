-- ============================================================
-- tasks — dashboard "Ближайшие задачи" widget
-- Added during dashboard work; this migration backfills the schema record.
-- Idempotent: safe to run on the existing production DB.
-- ============================================================
create table if not exists tasks (
  id         uuid primary key default gen_random_uuid(),
  title      text not null,
  due_date   date,
  is_done    boolean not null default false,
  created_at timestamptz not null default now()
);

alter table tasks enable row level security;
-- No policies → only SUPABASE_SECRET_KEY (service role) can read/write.
