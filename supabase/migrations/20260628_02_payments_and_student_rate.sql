-- ============================================================
-- Payments: per-lesson rate on the student, a price snapshot on each
-- completed lesson, and a payments table for one-off lesson payments.
-- No packages/subscriptions. Currency is always RUB.
-- Idempotent: safe to run on the existing production DB.
-- ============================================================

-- Per-lesson rate on the student (rubles).
alter table students add column if not exists rate numeric(10,2);

-- Snapshot of the student's rate at the moment a lesson is marked completed,
-- so later rate changes don't reprice past lessons. Null while not completed.
alter table lessons add column if not exists price numeric(10,2);

-- One-off lesson payments. Balance = sum(payments.amount) − sum(completed lesson prices).
create table if not exists payments (
  id         uuid primary key default gen_random_uuid(),
  student_id uuid not null references students(id) on delete cascade,
  amount     numeric(10,2) not null,
  note       text,
  paid_at    timestamptz not null default now(),
  created_at timestamptz not null default now()
);

alter table payments enable row level security;
-- No policies → only SUPABASE_SECRET_KEY (service role) can read/write.

create index if not exists payments_student_id_idx on payments(student_id);
