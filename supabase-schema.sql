create extension if not exists pgcrypto;

create table if not exists public.whispers (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('text', 'voice')),
  content text not null,
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
alter table public.reports enable row level security;

create policy "Public can read whispers"
  on public.whispers for select
  to anon
  using (expires_at > now());

create policy "Public can create whispers"
  on public.whispers for insert
  to anon
  with check (true);

create policy "Public can update whisper counters and safety state"
  on public.whispers for update
  to anon
  using (true)
  with check (true);

create policy "Public can read kindness replies"
  on public.kindness_replies for select
  to anon
  using (true);

create policy "Public can create kindness replies"
  on public.kindness_replies for insert
  to anon
  with check (true);

create policy "Public can update kindness reactions"
  on public.kindness_replies for update
  to anon
  using (true)
  with check (true);

create policy "Public can create reports"
  on public.reports for insert
  to anon
  with check (true);

create policy "Public can read recent reports"
  on public.reports for select
  to anon
  using (true);

insert into storage.buckets (id, name, public)
values ('whisper-audio', 'whisper-audio', true)
on conflict (id) do update set public = true;

create policy "Public can read whisper audio"
  on storage.objects for select
  to anon
  using (bucket_id = 'whisper-audio');

create policy "Public can upload whisper audio"
  on storage.objects for insert
  to anon
  with check (bucket_id = 'whisper-audio');

create policy "Public can replace whisper audio"
  on storage.objects for update
  to anon
  using (bucket_id = 'whisper-audio')
  with check (bucket_id = 'whisper-audio');
