-- ============================================================
-- LitLearn – Supabase Schema
-- Run this in your Supabase SQL editor
-- ============================================================

create extension if not exists "pgcrypto";

-- ── PROFILES (extends auth.users) ────────────────────────────
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  email       text unique not null,
  full_name   text,
  role        text not null default 'user' check (role in ('admin','user')),
  created_at  timestamptz default now()
);

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ── LEARNING NODES ────────────────────────────────────────────
create table if not exists public.learning_nodes (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  description text,
  "order"     integer not null,
  icon        text default 'book-open',
  category    text check (category in ('foundations','classical','modern','analysis','poetry')),
  genre       text default 'classics' check (genre in ('classics','fantasy','sci-fi','philosophy','nonfiction','mystery')),
  created_at  timestamptz default now()
);

-- ── LESSON CONTENT ────────────────────────────────────────────
create table if not exists public.lesson_content (
  id               uuid primary key default gen_random_uuid(),
  node_id          uuid references public.learning_nodes(id) on delete cascade,
  intro_guidance   text,
  intro_source     text,
  intro_source_url text,
  reading_time     text,
  slides_json      text default '[]',
  questions_json   text default '[]',
  created_at       timestamptz default now()
);

-- ── USER PROGRESS ─────────────────────────────────────────────
create table if not exists public.user_progress (
  id             uuid primary key default gen_random_uuid(),
  user_email     text not null,
  node_id        uuid references public.learning_nodes(id) on delete cascade,
  status         text default 'locked' check (status in ('locked','available','in_progress','completed')),
  score          integer default 0,
  completed_date date,
  created_at     timestamptz default now(),
  unique(user_email, node_id)
);

-- ── USER GOALS ────────────────────────────────────────────────
create table if not exists public.user_goals (
  id                 uuid primary key default gen_random_uuid(),
  user_email         text unique not null,
  daily_target       integer default 1,
  current_streak     integer default 0,
  longest_streak     integer default 0,
  lessons_today      integer default 0,
  total_lessons      integer default 0,
  last_activity_date date,
  created_at         timestamptz default now()
);

-- ── ACHIEVEMENTS ─────────────────────────────────────────────
create table if not exists public.achievements (
  id                uuid primary key default gen_random_uuid(),
  title             text not null,
  description       text,
  icon              text,
  requirement_count integer default 1,
  category          text check (category in ('lessons','streak','social','mastery')),
  created_at        timestamptz default now()
);

-- ── FRIENDSHIPS ──────────────────────────────────────────────
create table if not exists public.friendships (
  id           uuid primary key default gen_random_uuid(),
  user_email   text not null,
  friend_email text not null,
  friend_name  text,
  status       text default 'pending' check (status in ('pending','accepted')),
  created_at   timestamptz default now(),
  unique(user_email, friend_email)
);

-- ── ROW LEVEL SECURITY ───────────────────────────────────────
alter table public.profiles enable row level security;
alter table public.learning_nodes enable row level security;
alter table public.lesson_content enable row level security;
alter table public.user_progress enable row level security;
alter table public.user_goals enable row level security;
alter table public.achievements enable row level security;
alter table public.friendships enable row level security;

create policy "profiles_select" on public.profiles for select using (auth.uid() = id or exists(select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));
create policy "profiles_update" on public.profiles for update using (auth.uid() = id);
create policy "nodes_select" on public.learning_nodes for select using (auth.role() = 'authenticated');
create policy "nodes_insert" on public.learning_nodes for insert with check (exists(select 1 from public.profiles where id = auth.uid() and role = 'admin'));
create policy "nodes_update" on public.learning_nodes for update using (exists(select 1 from public.profiles where id = auth.uid() and role = 'admin'));
create policy "nodes_delete" on public.learning_nodes for delete using (exists(select 1 from public.profiles where id = auth.uid() and role = 'admin'));
create policy "content_select" on public.lesson_content for select using (auth.role() = 'authenticated');
create policy "content_write" on public.lesson_content for all using (exists(select 1 from public.profiles where id = auth.uid() and role = 'admin'));
create policy "progress_select" on public.user_progress for select using (user_email = auth.jwt()->>'email');
create policy "progress_insert" on public.user_progress for insert with check (user_email = auth.jwt()->>'email');
create policy "progress_update" on public.user_progress for update using (user_email = auth.jwt()->>'email');
create policy "goals_select" on public.user_goals for select using (user_email = auth.jwt()->>'email' or exists(select 1 from public.friendships f where f.user_email = auth.jwt()->>'email' and f.friend_email = user_goals.user_email and f.status = 'accepted'));
create policy "goals_insert" on public.user_goals for insert with check (user_email = auth.jwt()->>'email');
create policy "goals_update" on public.user_goals for update using (user_email = auth.jwt()->>'email');
create policy "achievements_select" on public.achievements for select using (auth.role() = 'authenticated');
create policy "achievements_write" on public.achievements for all using (exists(select 1 from public.profiles where id = auth.uid() and role = 'admin'));
create policy "friendships_select" on public.friendships for select using (user_email = auth.jwt()->>'email');
create policy "friendships_insert" on public.friendships for insert with check (user_email = auth.jwt()->>'email');
create policy "friendships_delete" on public.friendships for delete using (user_email = auth.jwt()->>'email');

-- ── SEED LEARNING NODES ──────────────────────────────────────
insert into public.learning_nodes (title, description, "order", icon, category, genre) values
  ('What is Literature?',    'Introduction to literary forms and why they matter',         1,  'book-open',  'foundations', 'classics'),
  ('Story Elements',         'Character, plot, setting, conflict, and theme',              2,  'layers',     'foundations', 'classics'),
  ('Reading Poetry',         'Rhythm, meter, and the villanelle form',                    3,  'feather',    'foundations', 'poetry'),
  ('The Epic Tradition',     'Homer and the roots of the Western story',                  4,  'landmark',   'classical',   'classics'),
  ('Shakespeare & Sonnets',  'The sonnet form and Shakespeare''s argument against time',  5,  'crown',      'classical',   'classics'),
  ('Figurative Language',    'Metaphor, simile, personification, and symbolism',          6,  'sparkles',   'foundations', 'classics'),
  ('Romantic Poetry',        'Nature, sublime, and imagination',                          7,  'flower-2',   'classical',   'classics'),
  ('Narration & Voice',      'Points of view and the unreliable narrator',                8,  'mic',        'modern',      'classics'),
  ('Modern Fiction',         'Kafka, alienation, and the absurd',                         9,  'book-marked','modern',      'classics'),
  ('World Literature',       'Magic realism and the danger of a single story',            10, 'globe',      'modern',      'classics')
on conflict do nothing;

-- ── SEED ACHIEVEMENTS ────────────────────────────────────────
insert into public.achievements (title, description, icon, requirement_count, category) values
  ('First Steps',      'Complete your first lesson',              'book-open',      1,  'lessons'),
  ('Scholar',          'Complete 5 lessons',                      'graduation-cap', 5,  'lessons'),
  ('Devoted Reader',   'Complete 10 lessons',                     'book',           10, 'lessons'),
  ('On Fire',          'Reach a 3-day streak',                    'flame',          3,  'streak'),
  ('Streak Master',    'Reach a 7-day streak',                    'calendar-check', 7,  'streak'),
  ('Social Butterfly', 'Add your first friend',                   'users',          1,  'social'),
  ('Perfect Score',    'Get a perfect score on any quiz',         'star',           1,  'mastery'),
  ('Poet''s Eye',      'Complete all poetry lessons',             'feather',        3,  'mastery')
on conflict do nothing;
