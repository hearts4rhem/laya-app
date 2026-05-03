create extension if not exists pgcrypto;

create table if not exists public.whispers (
  id uuid primary key default gen_random_uuid(),
  type text default 'text',
  content text,
  audio_url text default '',
  language text default 'English',
  mood text not null,
  intensity integer not null default 3 check (intensity between 1 and 5),
  created_at timestamptz not null default now(),
  expires_at timestamptz not null,
  kindness_count integer not null default 0,
  reported_count integer not null default 0,
  crisis_flagged boolean not null default false,
  hidden boolean not null default false,
  report_reasons text[] not null default '{}',
  detected_flags text[] not null default '{}',
  device_id text
);

alter table public.whispers
  add column if not exists type text,
  add column if not exists content text,
  add column if not exists audio_url text default '',
  add column if not exists language text default 'English',
  add column if not exists intensity integer not null default 3,
  add column if not exists kindness_count integer not null default 0,
  add column if not exists reported_count integer not null default 0,
  add column if not exists crisis_flagged boolean not null default false,
  add column if not exists hidden boolean not null default false,
  add column if not exists report_reasons text[] not null default '{}',
  add column if not exists detected_flags text[] not null default '{}',
  add column if not exists device_id text;

alter table public.whispers
  alter column type drop not null,
  alter column type set default 'text',
  alter column content drop not null;

create table if not exists public.kindness_replies (
  id uuid primary key default gen_random_uuid(),
  whisper_id uuid not null references public.whispers(id) on delete cascade,
  reply_tone text not null,
  message text not null,
  created_at timestamptz not null default now(),
  flagged boolean not null default false,
  blocked_reason text default '',
  device_id text,
  reaction_count integer not null default 0
);

alter table public.kindness_replies
  add column if not exists reply_tone text,
  add column if not exists message text,
  add column if not exists flagged boolean not null default false,
  add column if not exists blocked_reason text default '',
  add column if not exists device_id text,
  add column if not exists reaction_count integer not null default 0;

create table if not exists public.kindness_reactions (
  id uuid primary key default gen_random_uuid(),
  reply_id uuid not null references public.kindness_replies(id) on delete cascade,
  reaction text not null default '💜',
  created_at timestamptz not null default now(),
  device_id text
);

create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  whisper_id uuid references public.whispers(id) on delete cascade,
  reason text not null,
  optional_context text default '',
  created_at timestamptz not null default now(),
  device_id text
);

alter table public.whispers enable row level security;
alter table public.kindness_replies enable row level security;
alter table public.kindness_reactions enable row level security;
alter table public.reports enable row level security;

drop policy if exists "Public can read whispers" on public.whispers;
create policy "Public can read whispers"
  on public.whispers for select
  to anon
  using (expires_at > now());

drop policy if exists "Public can create whispers" on public.whispers;
create policy "Public can create whispers"
  on public.whispers for insert
  to anon
  with check (true);

drop policy if exists "Public can update whisper counters and safety state" on public.whispers;
create policy "Public can update whisper counters and safety state"
  on public.whispers for update
  to anon
  using (true)
  with check (true);

drop policy if exists "Public can read kindness replies" on public.kindness_replies;
create policy "Public can read kindness replies"
  on public.kindness_replies for select
  to anon
  using (true);

drop policy if exists "Public can create kindness replies" on public.kindness_replies;
create policy "Public can create kindness replies"
  on public.kindness_replies for insert
  to anon
  with check (true);

drop policy if exists "Public can update kindness reactions" on public.kindness_replies;
create policy "Public can update kindness reactions"
  on public.kindness_replies for update
  to anon
  using (true)
  with check (true);

drop policy if exists "Public can read kindness reactions" on public.kindness_reactions;
create policy "Public can read kindness reactions"
  on public.kindness_reactions for select
  to anon
  using (true);

drop policy if exists "Public can create kindness reactions" on public.kindness_reactions;
create policy "Public can create kindness reactions"
  on public.kindness_reactions for insert
  to anon
  with check (true);

drop policy if exists "Public can create reports" on public.reports;
create policy "Public can create reports"
  on public.reports for insert
  to anon
  with check (true);

drop policy if exists "Public can read recent reports" on public.reports;
create policy "Public can read recent reports"
  on public.reports for select
  to anon
  using (true);

insert into storage.buckets (id, name, public)
values ('whisper-audio', 'whisper-audio', true)
on conflict (id) do update set public = true;

drop policy if exists "Public can read whisper audio" on storage.objects;
create policy "Public can read whisper audio"
  on storage.objects for select
  to anon
  using (bucket_id = 'whisper-audio');

drop policy if exists "Public can upload whisper audio" on storage.objects;
create policy "Public can upload whisper audio"
  on storage.objects for insert
  to anon
  with check (bucket_id = 'whisper-audio');

drop policy if exists "Public can replace whisper audio" on storage.objects;
create policy "Public can replace whisper audio"
  on storage.objects for update
  to anon
  using (bucket_id = 'whisper-audio')
  with check (bucket_id = 'whisper-audio');
