-- Food MBTI schema for Supabase (Postgres)
-- Run this in Supabase SQL Editor.

create table if not exists public.categories (
  category_id bigint generated always as identity primary key,
  category_name varchar(100) not null,
  category_desc varchar(255),
  created_at timestamptz not null default now()
);

create table if not exists public.cat_types (
  cat_type_id bigint generated always as identity primary key,
  cat_type_name varchar(100) not null,
  category_id bigint not null references public.categories(category_id) on delete restrict,
  created_at timestamptz not null default now()
);

create table if not exists public.archetype_personas (
  archetype_persona_id bigint generated always as identity primary key,
  archetype_name varchar(100) not null,
  archetype_desc varchar(255),
  created_at timestamptz not null default now()
);

create table if not exists public.archetype_components (
  archetype_component_id bigint generated always as identity primary key,
  cat_type_id bigint not null references public.cat_types(cat_type_id) on delete restrict,
  archetype_persona_id bigint not null references public.archetype_personas(archetype_persona_id) on delete restrict,
  created_at timestamptz not null default now(),
  unique (cat_type_id, archetype_persona_id)
);

create table if not exists public.users (
  user_id bigint generated always as identity primary key,
  user_name varchar(100) not null unique,
  user_password text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.questions (
  question_id bigint generated always as identity primary key,
  question_text varchar(255) not null,
  category_id bigint not null references public.categories(category_id) on delete restrict,
  user_id bigint not null references public.users(user_id) on delete restrict,
  created_at timestamptz not null default now()
);

create table if not exists public.examinees (
  examinee_id bigint generated always as identity primary key,
  examinee_name varchar(100) not null,
  created_at timestamptz not null default now()
);

create table if not exists public.answers (
  answer_id bigint generated always as identity primary key,
  answer_value integer not null,
  examinee_id bigint not null references public.examinees(examinee_id) on delete cascade,
  question_id bigint not null references public.questions(question_id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (examinee_id, question_id)
);

create index if not exists idx_cat_types_category_id on public.cat_types(category_id);
create index if not exists idx_archetype_components_cat_type_id on public.archetype_components(cat_type_id);
create index if not exists idx_archetype_components_archetype_persona_id on public.archetype_components(archetype_persona_id);
create index if not exists idx_questions_category_id on public.questions(category_id);
create index if not exists idx_questions_user_id on public.questions(user_id);
create index if not exists idx_answers_examinee_id on public.answers(examinee_id);
create index if not exists idx_answers_question_id on public.answers(question_id);

-- Baseline RLS: enable and allow all for now (development).
-- Replace with stricter policies before production release.
alter table public.categories enable row level security;
alter table public.cat_types enable row level security;
alter table public.archetype_personas enable row level security;
alter table public.archetype_components enable row level security;
alter table public.users enable row level security;
alter table public.questions enable row level security;
alter table public.examinees enable row level security;
alter table public.answers enable row level security;

drop policy if exists "dev_all_categories" on public.categories;
create policy "dev_all_categories" on public.categories for all using (true) with check (true);

drop policy if exists "dev_all_cat_types" on public.cat_types;
create policy "dev_all_cat_types" on public.cat_types for all using (true) with check (true);

drop policy if exists "dev_all_archetype_personas" on public.archetype_personas;
create policy "dev_all_archetype_personas" on public.archetype_personas for all using (true) with check (true);

drop policy if exists "dev_all_archetype_components" on public.archetype_components;
create policy "dev_all_archetype_components" on public.archetype_components for all using (true) with check (true);

drop policy if exists "dev_all_users" on public.users;
create policy "dev_all_users" on public.users for all using (true) with check (true);

drop policy if exists "dev_all_questions" on public.questions;
create policy "dev_all_questions" on public.questions for all using (true) with check (true);

drop policy if exists "dev_all_examinees" on public.examinees;
create policy "dev_all_examinees" on public.examinees for all using (true) with check (true);

drop policy if exists "dev_all_answers" on public.answers;
create policy "dev_all_answers" on public.answers for all using (true) with check (true);
