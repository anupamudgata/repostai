-- Photo → caption → auto-post feature (Supabase; no Prisma)
-- Extends connected_accounts platforms if still on legacy check.

alter table public.connected_accounts
  drop constraint if exists connected_accounts_platform_check;

alter table public.connected_accounts
  add constraint connected_accounts_platform_check
  check (platform in ('twitter', 'linkedin', 'facebook', 'instagram', 'reddit'));

alter table public.profiles
  add column if not exists photos_uploaded_this_month integer not null default 0,
  add column if not exists photos_usage_month text;

create table if not exists public.photo_uploads (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  storage_key text not null,
  public_url text not null,
  thumbnail_url text,
  file_size integer not null,
  width integer,
  height integer,
  format text,
  vision_analysis jsonb,
  user_context text,
  status text not null default 'processing'
    check (status in ('processing', 'completed', 'failed')),
  error_message text,
  created_at timestamptz not null default now()
);

create index if not exists idx_photo_uploads_user_id on public.photo_uploads(user_id);
create index if not exists idx_photo_uploads_created_at on public.photo_uploads(created_at desc);
create index if not exists idx_photo_uploads_status on public.photo_uploads(status);

alter table public.photo_uploads enable row level security;

drop policy if exists "Users select own photo_uploads" on public.photo_uploads;
drop policy if exists "Users insert own photo_uploads" on public.photo_uploads;
drop policy if exists "Users update own photo_uploads" on public.photo_uploads;
drop policy if exists "Users delete own photo_uploads" on public.photo_uploads;

create policy "Users select own photo_uploads"
  on public.photo_uploads for select using (auth.uid() = user_id);
create policy "Users insert own photo_uploads"
  on public.photo_uploads for insert with check (auth.uid() = user_id);
create policy "Users update own photo_uploads"
  on public.photo_uploads for update using (auth.uid() = user_id);
create policy "Users delete own photo_uploads"
  on public.photo_uploads for delete using (auth.uid() = user_id);

create table if not exists public.photo_caption_runs (
  id uuid primary key default gen_random_uuid(),
  photo_id uuid references public.photo_uploads(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  platforms text[] not null default '{}',
  captions jsonb not null default '{}'::jsonb,
  status text not null default 'draft'
    check (status in ('draft', 'scheduled', 'posting', 'posted', 'failed')),
  scheduled_for timestamptz,
  posted_at timestamptz,
  post_urls jsonb,
  error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_photo_caption_runs_user_id on public.photo_caption_runs(user_id);
create index if not exists idx_photo_caption_runs_photo_id on public.photo_caption_runs(photo_id);
create index if not exists idx_photo_caption_runs_status_scheduled
  on public.photo_caption_runs(status, scheduled_for);

alter table public.photo_caption_runs enable row level security;

drop policy if exists "Users select own photo_caption_runs" on public.photo_caption_runs;
drop policy if exists "Users insert own photo_caption_runs" on public.photo_caption_runs;
drop policy if exists "Users update own photo_caption_runs" on public.photo_caption_runs;
drop policy if exists "Users delete own photo_caption_runs" on public.photo_caption_runs;

create policy "Users select own photo_caption_runs"
  on public.photo_caption_runs for select using (auth.uid() = user_id);
create policy "Users insert own photo_caption_runs"
  on public.photo_caption_runs for insert with check (auth.uid() = user_id);
create policy "Users update own photo_caption_runs"
  on public.photo_caption_runs for update using (auth.uid() = user_id);
create policy "Users delete own photo_caption_runs"
  on public.photo_caption_runs for delete using (auth.uid() = user_id);
