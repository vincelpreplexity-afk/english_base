-- ============================================================
-- Tutor CRM — initial schema
-- Apply via: Supabase Dashboard → SQL Editor → Run
-- ============================================================

-- Trigger helper: auto-update updated_at on row change
create or replace function update_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ============================================================
-- topics
-- Master list of grammar / vocabulary / skill topics.
-- ============================================================
create table topics (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  description text,
  order_index integer not null default 0,  -- for manual sorting in the UI
  created_at  timestamptz not null default now()
);

alter table topics enable row level security;
-- No policies → only SUPABASE_SECRET_KEY (service role) can read/write.

-- ============================================================
-- students
-- ============================================================
create table students (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  -- contacts stored as flexible JSON: { phone, email, telegram, … }
  contacts    jsonb not null default '{}',
  -- CEFR or descriptive level as free text: A1, B1, Upper-Intermediate, …
  level       text,
  notes       text,           -- free-form: weak spots, dynamics, comments
  is_archived boolean not null default false,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

alter table students enable row level security;

create trigger students_updated_at
  before update on students
  for each row execute function update_updated_at();

-- ============================================================
-- student_topics
-- Tracks each student's progress on each topic.
-- ============================================================
create type topic_status as enum ('planned', 'in_progress', 'done');

create table student_topics (
  id         uuid primary key default gen_random_uuid(),
  student_id uuid not null references students(id) on delete cascade,
  topic_id   uuid not null references topics(id)   on delete cascade,
  status     topic_status not null default 'planned',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (student_id, topic_id)
);

alter table student_topics enable row level security;

create trigger student_topics_updated_at
  before update on student_topics
  for each row execute function update_updated_at();

create index student_topics_student_id_idx on student_topics(student_id);

-- ============================================================
-- lessons
-- ============================================================
create type lesson_status as enum ('scheduled', 'completed', 'cancelled');

create table lessons (
  id           uuid primary key default gen_random_uuid(),
  student_id   uuid not null references students(id) on delete cascade,
  scheduled_at timestamptz not null,
  duration_min integer not null default 60,
  status       lesson_status not null default 'scheduled',
  notes        text,          -- post-lesson notes / homework assigned
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

alter table lessons enable row level security;

create trigger lessons_updated_at
  before update on lessons
  for each row execute function update_updated_at();

-- Calendar queries filter/order by time constantly
create index lessons_scheduled_at_idx on lessons(scheduled_at);
create index lessons_student_id_idx   on lessons(student_id);

-- ============================================================
-- materials
-- ============================================================
create type material_type as enum ('file', 'link');

create table materials (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  description text,
  type        material_type not null,
  -- For 'link': the external URL.
  -- For 'file': the Supabase Storage object path.
  url         text,
  -- Difficulty/audience level, same free-text convention as students.level
  level       text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

alter table materials enable row level security;

create trigger materials_updated_at
  before update on materials
  for each row execute function update_updated_at();

-- ============================================================
-- material_topics  (many-to-many: materials ↔ topics)
-- ============================================================
create table material_topics (
  material_id uuid not null references materials(id) on delete cascade,
  topic_id    uuid not null references topics(id)    on delete cascade,
  primary key (material_id, topic_id)
);

alter table material_topics enable row level security;

create index material_topics_topic_id_idx on material_topics(topic_id);
