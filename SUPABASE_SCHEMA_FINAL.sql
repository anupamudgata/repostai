-- ============================================
-- RepostAI — Complete Schema + Migration (FINAL)
-- Safe for: empty database (creates everything) or existing (adds missing columns/policies)
-- INCLUDES: All 11 languages, security fixes, RLS, triggers, RPCs, backfill, indexes
-- Paste this entire file into Supabase SQL Editor and run once.
-- ============================================

create extension if not exists "uuid-ossp";

-- ============================================
-- 0. PRE-FLIGHT — Clean up bad data BEFORE any constraint changes
-- ============================================

-- Fix output_language in repurpose_jobs (normalize + default bad values)
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'repurpose_jobs') THEN
    UPDATE public.repurpose_jobs
    SET output_language = lower(trim(output_language))
    WHERE output_language IS NOT NULL AND output_language <> lower(trim(output_language));

    UPDATE public.repurpose_jobs
    SET output_language = 'en'
    WHERE output_language IS NULL
       OR trim(output_language) = ''
       OR output_language NOT IN ('en', 'hi', 'mr', 'bn', 'te', 'kn', 'or', 'pa', 'es', 'pt', 'fr');
  END IF;
END $$;

-- Fix output_language in created_posts
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'created_posts') THEN
    UPDATE public.created_posts
    SET output_language = lower(trim(output_language))
    WHERE output_language IS NOT NULL AND output_language <> lower(trim(output_language));

    UPDATE public.created_posts
    SET output_language = 'en'
    WHERE output_language IS NULL
       OR trim(output_language) = ''
       OR output_language NOT IN ('en', 'hi', 'mr', 'bn', 'te', 'kn', 'or', 'pa', 'es', 'pt', 'fr');
  END IF;
END $$;

-- Drop old constraints BEFORE table creation
DO $$ BEGIN
  ALTER TABLE public.repurpose_jobs DROP CONSTRAINT IF EXISTS repurpose_jobs_output_language_check;
  EXCEPTION WHEN undefined_table THEN NULL;
END $$;
DO $$ BEGIN
  ALTER TABLE public.created_posts DROP CONSTRAINT IF EXISTS created_posts_output_language_check;
  EXCEPTION WHEN undefined_table THEN NULL;
END $$;

-- ============================================
-- 1. TABLES (CREATE IF NOT EXISTS)
-- ============================================

create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  name text,
  avatar_url text,
  plan text not null default 'free' check (plan in ('free', 'starter', 'pro', 'agency')),
  stripe_customer_id text,
  market_region text,
  zapier_webhook_url text,
  photos_uploaded_this_month integer not null default 0,
  photos_usage_month text,
  created_at timestamptz not null default now(),
  updated_at timestamptz default now()
);

create table if not exists public.subscriptions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles(id) on delete cascade not null unique,
  stripe_subscription_id text unique,
  stripe_price_id text,
  razorpay_order_id text,
  razorpay_payment_id text,
  plan text not null check (plan in ('starter', 'pro', 'agency')),
  status text not null default 'active' check (status in ('active', 'canceled', 'past_due', 'trialing', 'pending', 'halted')),
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancel_at_period_end boolean default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz default now()
);

create table if not exists public.brand_voices (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  name text not null,
  samples text,
  sample_text text,
  description text,
  persona text,
  persona_generated_at timestamptz,
  persona_model text,
  samples_hash text,
  humanization_level text default 'professional',
  imperfection_mode boolean default false,
  personal_story_injection boolean default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz default now()
);

create table if not exists public.repurpose_jobs (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  input_type text not null check (input_type in ('text', 'url', 'youtube', 'pdf')),
  input_content text,
  input_url text,
  constraint repurpose_jobs_input_check check (
    (input_content is not null and trim(input_content) <> '') or (input_url is not null and trim(input_url) <> '')
  ),
  brand_voice_id uuid references public.brand_voices(id) on delete set null,
  output_language text not null default 'en' check (output_language in ('en', 'hi', 'mr', 'bn', 'te', 'kn', 'or', 'pa', 'es', 'pt', 'fr')),
  outputs jsonb default '[]'::jsonb,
  status text default 'pending' check (status in ('pending', 'completed', 'failed')),
  created_at timestamptz not null default now()
);

create table if not exists public.repurpose_outputs (
  id uuid primary key default uuid_generate_v4(),
  job_id uuid references public.repurpose_jobs(id) on delete cascade not null,
  platform text not null,
  generated_content text not null,
  edited_content text,
  created_at timestamptz not null default now()
);

create table if not exists public.usage (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  month text not null,
  repurpose_count integer not null default 0,
  unique (user_id, month)
);

create table if not exists public.created_posts (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  topic text not null,
  tone text not null check (tone in ('professional', 'casual', 'humorous', 'inspirational', 'educational')),
  length text not null check (length in ('short', 'medium', 'long')),
  audience text not null,
  output_language text not null default 'en' check (output_language in ('en', 'hi', 'mr', 'bn', 'te', 'kn', 'or', 'pa', 'es', 'pt', 'fr')),
  generated_content text not null,
  brand_voice_id uuid references public.brand_voices(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.connected_accounts (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  platform text not null check (platform in ('linkedin', 'twitter', 'facebook', 'instagram', 'reddit')),
  platform_user_id text,
  platform_username text,
  platform_avatar text,
  access_token text,
  refresh_token text,
  token_expires_at timestamptz,
  scope text,
  meta jsonb,
  provider text,
  encrypted_access_token text,
  encrypted_refresh_token text,
  username text,
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz default now(),
  unique (user_id, platform)
);

create unique index if not exists idx_connected_accounts_user_provider
  on public.connected_accounts(user_id, provider);

create table if not exists public.scheduled_posts (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  connected_account_id uuid references public.connected_accounts(id) on delete cascade,
  output_id uuid references public.repurpose_outputs(id) on delete cascade,
  platform text not null,
  scheduled_at timestamptz not null,
  status text not null default 'pending'
    check (status in ('pending', 'processing', 'completed', 'published', 'failed')),
  posted_at timestamptz,
  published_at timestamptz,
  error_message text,
  created_at timestamptz not null default now(),
  updated_at timestamptz default now()
);

create table if not exists public.post_engagement (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  scheduled_post_id uuid references public.scheduled_posts(id) on delete set null,
  platform text not null,
  content_preview text,
  posted_at timestamptz not null,
  likes integer not null default 0,
  comments integer not null default 0,
  shares integer not null default 0,
  impressions integer not null default 0,
  clicks integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

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

create table if not exists public.razorpay_orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  razorpay_order_id text unique not null,
  plan text not null check (plan in ('starter', 'pro', 'agency')),
  amount integer,
  currency text default 'INR',
  status text default 'created',
  created_at timestamptz not null default now()
);

-- ============================================
-- 2. MIGRATION — Add missing columns + fix constraints
-- ============================================

-- profiles
alter table public.profiles
  add column if not exists zapier_webhook_url text,
  add column if not exists photos_uploaded_this_month integer not null default 0,
  add column if not exists photos_usage_month text,
  add column if not exists updated_at timestamptz default now();

alter table public.profiles drop constraint if exists profiles_plan_check;
alter table public.profiles add constraint profiles_plan_check
  check (plan in ('free', 'starter', 'pro', 'agency'));

-- subscriptions
alter table public.subscriptions drop column if exists stripe_customer_id;
alter table public.subscriptions
  add column if not exists stripe_price_id text,
  add column if not exists razorpay_order_id text,
  add column if not exists razorpay_payment_id text,
  add column if not exists current_period_start timestamptz,
  add column if not exists cancel_at_period_end boolean default false,
  add column if not exists updated_at timestamptz default now();

alter table public.subscriptions alter column stripe_subscription_id drop not null;
alter table public.subscriptions alter column current_period_end drop not null;

alter table public.subscriptions drop constraint if exists subscriptions_plan_check;
alter table public.subscriptions add constraint subscriptions_plan_check
  check (plan in ('starter', 'pro', 'agency'));

alter table public.subscriptions drop constraint if exists subscriptions_status_check;
alter table public.subscriptions add constraint subscriptions_status_check
  check (status in ('active', 'canceled', 'past_due', 'trialing', 'pending', 'halted'));

do $$ begin
  if not exists (
    select 1 from pg_constraint where conname = 'subscriptions_user_id_key'
  ) then
    begin
      alter table public.subscriptions add constraint subscriptions_user_id_key unique (user_id);
    exception when others then null;
    end;
  end if;
end $$;

-- brand_voices
alter table public.brand_voices
  add column if not exists samples text,
  add column if not exists sample_text text,
  add column if not exists persona text,
  add column if not exists persona_generated_at timestamptz,
  add column if not exists persona_model text,
  add column if not exists samples_hash text,
  add column if not exists humanization_level text default 'professional',
  add column if not exists imperfection_mode boolean default false,
  add column if not exists personal_story_injection boolean default false,
  add column if not exists updated_at timestamptz default now();

do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'brand_voices' and column_name = 'sample_text'
  ) then
    update public.brand_voices set samples = sample_text
    where (samples is null or samples = '') and sample_text is not null;
  end if;
end $$;

-- repurpose_jobs
alter table public.repurpose_jobs alter column input_content drop not null;
alter table public.repurpose_jobs
  add column if not exists outputs jsonb default '[]'::jsonb,
  add column if not exists status text default 'pending';

alter table public.repurpose_jobs drop constraint if exists repurpose_jobs_input_check;
alter table public.repurpose_jobs add constraint repurpose_jobs_input_check check (
  (input_content is not null and trim(input_content) <> '') or (input_url is not null and trim(input_url) <> '')
);

-- CRITICAL: Use ALL 11 languages
alter table public.repurpose_jobs drop constraint if exists repurpose_jobs_output_language_check;
alter table public.repurpose_jobs add constraint repurpose_jobs_output_language_check
  check (output_language in ('en', 'hi', 'mr', 'bn', 'te', 'kn', 'or', 'pa', 'es', 'pt', 'fr'));

alter table public.repurpose_jobs drop constraint if exists repurpose_jobs_status_check;
alter table public.repurpose_jobs add constraint repurpose_jobs_status_check
  check (status in ('pending', 'completed', 'failed'));

-- CRITICAL: Use ALL 11 languages
alter table public.created_posts drop constraint if exists created_posts_output_language_check;
alter table public.created_posts add constraint created_posts_output_language_check
  check (output_language in ('en', 'hi', 'mr', 'bn', 'te', 'kn', 'or', 'pa', 'es', 'pt', 'fr'));

-- connected_accounts
alter table public.connected_accounts
  add column if not exists platform text,
  add column if not exists platform_user_id text,
  add column if not exists platform_username text,
  add column if not exists platform_avatar text,
  add column if not exists access_token text,
  add column if not exists refresh_token text,
  add column if not exists token_expires_at timestamptz,
  add column if not exists scope text,
  add column if not exists meta jsonb,
  add column if not exists provider text,
  add column if not exists encrypted_access_token text,
  add column if not exists encrypted_refresh_token text,
  add column if not exists username text,
  add column if not exists expires_at timestamptz,
  add column if not exists updated_at timestamptz default now();

-- scheduled_posts
alter table public.scheduled_posts
  add column if not exists published_at timestamptz,
  add column if not exists updated_at timestamptz default now();

alter table public.scheduled_posts alter column connected_account_id drop not null;
alter table public.scheduled_posts alter column output_id drop not null;

alter table public.scheduled_posts drop constraint if exists scheduled_posts_status_check;
alter table public.scheduled_posts add constraint scheduled_posts_status_check
  check (status in ('pending', 'processing', 'completed', 'published', 'failed'));

-- ============================================
-- 3. ROW LEVEL SECURITY — Enable on all tables
-- ============================================

alter table public.profiles enable row level security;
alter table public.subscriptions enable row level security;
alter table public.brand_voices enable row level security;
alter table public.repurpose_jobs enable row level security;
alter table public.repurpose_outputs enable row level security;
alter table public.usage enable row level security;
alter table public.created_posts enable row level security;
alter table public.connected_accounts enable row level security;
alter table public.scheduled_posts enable row level security;
alter table public.post_engagement enable row level security;
alter table public.photo_uploads enable row level security;
alter table public.photo_caption_runs enable row level security;
alter table public.razorpay_orders enable row level security;

-- ============================================
-- 4. POLICIES (Drop then create — idempotent)
-- ============================================

-- profiles (SELECT + UPDATE + INSERT)
drop policy if exists "Users can view their own profile" on public.profiles;
drop policy if exists "Users can update their own profile" on public.profiles;
drop policy if exists "Users can insert their own profile" on public.profiles;
create policy "Users can view their own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can update their own profile" on public.profiles for update using (auth.uid() = id);
create policy "Users can insert their own profile" on public.profiles for insert with check (auth.uid() = id);

-- subscriptions (SELECT only — writes via service role)
drop policy if exists "Users can view their own subscriptions" on public.subscriptions;
create policy "Users can view their own subscriptions" on public.subscriptions for select using (auth.uid() = user_id);

-- brand_voices
drop policy if exists "Users can view their own brand voices" on public.brand_voices;
drop policy if exists "Users can create their own brand voices" on public.brand_voices;
drop policy if exists "Users can update their own brand voices" on public.brand_voices;
drop policy if exists "Users can delete their own brand voices" on public.brand_voices;
create policy "Users can view their own brand voices" on public.brand_voices for select using (auth.uid() = user_id);
create policy "Users can create their own brand voices" on public.brand_voices for insert with check (auth.uid() = user_id);
create policy "Users can update their own brand voices" on public.brand_voices for update using (auth.uid() = user_id);
create policy "Users can delete their own brand voices" on public.brand_voices for delete using (auth.uid() = user_id);

-- repurpose_jobs
drop policy if exists "Users can view their own jobs" on public.repurpose_jobs;
drop policy if exists "Users can create their own jobs" on public.repurpose_jobs;
drop policy if exists "Users can update their own jobs" on public.repurpose_jobs;
drop policy if exists "Users can delete their own jobs" on public.repurpose_jobs;
create policy "Users can view their own jobs" on public.repurpose_jobs for select using (auth.uid() = user_id);
create policy "Users can create their own jobs" on public.repurpose_jobs for insert with check (auth.uid() = user_id);
create policy "Users can update their own jobs" on public.repurpose_jobs for update using (auth.uid() = user_id);
create policy "Users can delete their own jobs" on public.repurpose_jobs for delete using (auth.uid() = user_id);

-- repurpose_outputs
drop policy if exists "Users can view outputs for their own jobs" on public.repurpose_outputs;
drop policy if exists "Users can insert outputs for their own jobs" on public.repurpose_outputs;
drop policy if exists "Users can update outputs for their own jobs" on public.repurpose_outputs;
drop policy if exists "Users can delete outputs for their own jobs" on public.repurpose_outputs;
create policy "Users can view outputs for their own jobs" on public.repurpose_outputs for select using (
  exists (select 1 from public.repurpose_jobs where repurpose_jobs.id = repurpose_outputs.job_id and repurpose_jobs.user_id = auth.uid())
);
create policy "Users can insert outputs for their own jobs" on public.repurpose_outputs for insert with check (
  exists (select 1 from public.repurpose_jobs where repurpose_jobs.id = repurpose_outputs.job_id and repurpose_jobs.user_id = auth.uid())
);
create policy "Users can update outputs for their own jobs" on public.repurpose_outputs for update using (
  exists (select 1 from public.repurpose_jobs where repurpose_jobs.id = repurpose_outputs.job_id and repurpose_jobs.user_id = auth.uid())
);
create policy "Users can delete outputs for their own jobs" on public.repurpose_outputs for delete using (
  exists (select 1 from public.repurpose_jobs where repurpose_jobs.id = repurpose_outputs.job_id and repurpose_jobs.user_id = auth.uid())
);

-- usage
drop policy if exists "Users can view their own usage" on public.usage;
drop policy if exists "Users can insert their own usage" on public.usage;
drop policy if exists "Users can update their own usage" on public.usage;
create policy "Users can view their own usage" on public.usage for select using (auth.uid() = user_id);
create policy "Users can insert their own usage" on public.usage for insert with check (auth.uid() = user_id);
create policy "Users can update their own usage" on public.usage for update using (auth.uid() = user_id);

-- created_posts
drop policy if exists "Users can view their own created posts" on public.created_posts;
drop policy if exists "Users can create their own posts" on public.created_posts;
create policy "Users can view their own created posts" on public.created_posts for select using (auth.uid() = user_id);
create policy "Users can create their own posts" on public.created_posts for insert with check (auth.uid() = user_id);

-- connected_accounts
drop policy if exists "Users can view their own connected accounts" on public.connected_accounts;
drop policy if exists "Users can insert their own connected accounts" on public.connected_accounts;
drop policy if exists "Users can update their own connected accounts" on public.connected_accounts;
drop policy if exists "Users can delete their own connected accounts" on public.connected_accounts;
create policy "Users can view their own connected accounts" on public.connected_accounts for select using (auth.uid() = user_id);
create policy "Users can insert their own connected accounts" on public.connected_accounts for insert with check (auth.uid() = user_id);
create policy "Users can update their own connected accounts" on public.connected_accounts for update using (auth.uid() = user_id);
create policy "Users can delete their own connected accounts" on public.connected_accounts for delete using (auth.uid() = user_id);

-- scheduled_posts
drop policy if exists "Users can view their own scheduled posts" on public.scheduled_posts;
drop policy if exists "Users can create their own scheduled posts" on public.scheduled_posts;
drop policy if exists "Users can update their own scheduled posts" on public.scheduled_posts;
drop policy if exists "Users can delete their own scheduled posts" on public.scheduled_posts;
create policy "Users can view their own scheduled posts" on public.scheduled_posts for select using (auth.uid() = user_id);
create policy "Users can create their own scheduled posts" on public.scheduled_posts for insert with check (auth.uid() = user_id);
create policy "Users can update their own scheduled posts" on public.scheduled_posts for update using (auth.uid() = user_id);
create policy "Users can delete their own scheduled posts" on public.scheduled_posts for delete using (auth.uid() = user_id);

-- post_engagement
drop policy if exists "Users can view their own engagement" on public.post_engagement;
drop policy if exists "Users can insert their own engagement" on public.post_engagement;
drop policy if exists "Users can update their own engagement" on public.post_engagement;
drop policy if exists "Users can delete their own engagement" on public.post_engagement;
create policy "Users can view their own engagement" on public.post_engagement for select using (auth.uid() = user_id);
create policy "Users can insert their own engagement" on public.post_engagement for insert with check (auth.uid() = user_id);
create policy "Users can update their own engagement" on public.post_engagement for update using (auth.uid() = user_id);
create policy "Users can delete their own engagement" on public.post_engagement for delete using (auth.uid() = user_id);

-- photo_uploads
drop policy if exists "Users select own photo_uploads" on public.photo_uploads;
drop policy if exists "Users insert own photo_uploads" on public.photo_uploads;
drop policy if exists "Users update own photo_uploads" on public.photo_uploads;
drop policy if exists "Users delete own photo_uploads" on public.photo_uploads;
create policy "Users select own photo_uploads" on public.photo_uploads for select using (auth.uid() = user_id);
create policy "Users insert own photo_uploads" on public.photo_uploads for insert with check (auth.uid() = user_id);
create policy "Users update own photo_uploads" on public.photo_uploads for update using (auth.uid() = user_id);
create policy "Users delete own photo_uploads" on public.photo_uploads for delete using (auth.uid() = user_id);

-- photo_caption_runs
drop policy if exists "Users select own photo_caption_runs" on public.photo_caption_runs;
drop policy if exists "Users insert own photo_caption_runs" on public.photo_caption_runs;
drop policy if exists "Users update own photo_caption_runs" on public.photo_caption_runs;
drop policy if exists "Users delete own photo_caption_runs" on public.photo_caption_runs;
create policy "Users select own photo_caption_runs" on public.photo_caption_runs for select using (auth.uid() = user_id);
create policy "Users insert own photo_caption_runs" on public.photo_caption_runs for insert with check (auth.uid() = user_id);
create policy "Users update own photo_caption_runs" on public.photo_caption_runs for update using (auth.uid() = user_id);
create policy "Users delete own photo_caption_runs" on public.photo_caption_runs for delete using (auth.uid() = user_id);

-- ============================================
-- 5. TRIGGER — Auto-create profile on signup
-- ============================================

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, name, avatar_url, market_region)
  values (
    new.id,
    coalesce(nullif(trim(new.email), ''), replace(new.id::text, '-', '') || '@users.repostai.local'),
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'),
    new.raw_user_meta_data->>'avatar_url',
    new.raw_user_meta_data->>'market_region'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================
-- 6. RPC — ensure_profile_from_auth (JWT-based)
-- ============================================

create or replace function public.ensure_profile_from_auth()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  u_email text;
  meta jsonb;
begin
  if uid is null then
    raise exception 'Not authenticated';
  end if;

  if exists (select 1 from public.profiles p where p.id = uid) then
    return;
  end if;

  select u.email, u.raw_user_meta_data into u_email, meta
  from auth.users u
  where u.id = uid;

  if not found then
    raise exception 'auth user not found';
  end if;

  insert into public.profiles (id, email, name, avatar_url, market_region)
  values (
    uid,
    coalesce(nullif(trim(u_email), ''), replace(uid::text, '-', '') || '@users.repostai.local'),
    coalesce(meta->>'full_name', meta->>'name'),
    meta->>'avatar_url',
    meta->>'market_region'
  );
exception
  when unique_violation then
    null;
end;
$$;

revoke all on function public.ensure_profile_from_auth() from public;
grant execute on function public.ensure_profile_from_auth() to authenticated;
grant execute on function public.ensure_profile_from_auth() to service_role;

-- ============================================
-- 7. FUNCTION — Atomic usage increment
-- ============================================

create or replace function public.increment_usage(p_user_id uuid, p_month text)
returns void as $$
begin
  insert into public.usage (user_id, month, repurpose_count)
  values (p_user_id, p_month, 1)
  on conflict (user_id, month)
  do update set repurpose_count = usage.repurpose_count + 1;
end;
$$ language plpgsql security definer;

-- ============================================
-- 8. BACKFILL — Create profiles for existing users without one
-- ============================================

INSERT INTO public.profiles (id, email, name, avatar_url, market_region)
SELECT
  u.id,
  COALESCE(NULLIF(TRIM(u.email), ''), REPLACE(u.id::text, '-', '') || '@users.repostai.local'),
  COALESCE(u.raw_user_meta_data->>'full_name', u.raw_user_meta_data->>'name'),
  u.raw_user_meta_data->>'avatar_url',
  u.raw_user_meta_data->>'market_region'
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
WHERE p.id IS NULL
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- 9. CLEANUP — Reset stale profiles.plan to 'free'
-- ============================================

-- This is the CRITICAL SECURITY FIX for the payment bypass vulnerability
-- Reset any free users who somehow have 'pro'/'starter'/'agency' without active subscription
UPDATE profiles
SET plan = 'free', updated_at = now()
WHERE plan IN ('starter', 'pro', 'agency')
  AND id NOT IN (
    SELECT user_id FROM subscriptions
    WHERE status IN ('active', 'trialing')
  );

-- ============================================
-- 10. INDEXES
-- ============================================

create index if not exists idx_repurpose_jobs_user_id on public.repurpose_jobs(user_id);
create index if not exists idx_repurpose_jobs_created_at on public.repurpose_jobs(created_at desc);
create index if not exists idx_repurpose_outputs_job_id on public.repurpose_outputs(job_id);
create index if not exists idx_brand_voices_user_id on public.brand_voices(user_id);
create index if not exists idx_usage_user_month on public.usage(user_id, month);
create index if not exists idx_subscriptions_user_id on public.subscriptions(user_id);
create index if not exists idx_created_posts_user_id on public.created_posts(user_id);
create index if not exists idx_created_posts_created_at on public.created_posts(created_at desc);
create index if not exists idx_connected_accounts_user_id on public.connected_accounts(user_id);
create index if not exists idx_scheduled_posts_user_id on public.scheduled_posts(user_id);
create index if not exists idx_scheduled_posts_scheduled_at_status on public.scheduled_posts(scheduled_at, status);
create index if not exists idx_post_engagement_user_id on public.post_engagement(user_id);
create index if not exists idx_post_engagement_posted_at on public.post_engagement(posted_at desc);
create index if not exists idx_post_engagement_platform on public.post_engagement(platform);
create index if not exists idx_photo_uploads_user_id on public.photo_uploads(user_id);
create index if not exists idx_photo_uploads_created_at on public.photo_uploads(created_at desc);
create index if not exists idx_photo_uploads_status on public.photo_uploads(status);
create index if not exists idx_photo_caption_runs_user_id on public.photo_caption_runs(user_id);
create index if not exists idx_photo_caption_runs_photo_id on public.photo_caption_runs(photo_id);
create index if not exists idx_photo_caption_runs_status_scheduled on public.photo_caption_runs(status, scheduled_for);
create index if not exists idx_razorpay_orders_user_id on public.razorpay_orders(user_id);

-- ============================================
-- VERIFICATION QUERIES (Run after execution)
-- ============================================
-- SELECT COUNT(*) as table_count FROM information_schema.tables WHERE table_schema = 'public';
-- Expected: 13 tables

-- SELECT COUNT(*) as users_without_profile FROM auth.users u
--   LEFT JOIN profiles p ON u.id = p.id WHERE p.id IS NULL;
-- Expected: 0

-- SELECT COUNT(*) as stale_paid_profiles FROM profiles p
--   LEFT JOIN subscriptions s ON s.user_id = p.id AND s.status IN ('active', 'trialing')
--   WHERE p.plan IN ('starter', 'pro', 'agency') AND s.id IS NULL;
-- Expected: 0
