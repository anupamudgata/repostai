-- ============================================
-- RepostAI Database Schema (corrected for Supabase)
-- Run this in your Supabase SQL Editor
-- ============================================
-- Fixes vs your paste:
-- 1. Removed typo "check all correct from superbass" from profiles (was a syntax error)
-- 2. Added market_region to profiles + handle_new_user (signup/settings use it)
-- 3. Subscriptions: added current_period_start, stripe_price_id, cancel_at_period_end, updated_at, stripe_customer_id (Stripe webhook needs these)
-- 4. Brand voices: use "samples" (app API uses this), added persona, persona_generated_at, samples_hash, updated_at
-- 5. repurpose_jobs + created_posts: output_language check includes 'pt', 'fr'
-- 6. connected_accounts: use platform, access_token, refresh_token, etc. (new social posting code expects these)
-- ============================================

create extension if not exists "uuid-ossp";

-- ============================================
-- PROFILES TABLE
-- ============================================
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  name text,
  avatar_url text,
  plan text not null default 'free' check (plan in ('free', 'pro', 'agency')),
  stripe_customer_id text,
  market_region text,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Users can view their own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, name, avatar_url, market_region)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'),
    new.raw_user_meta_data->>'avatar_url',
    new.raw_user_meta_data->>'market_region'
  );
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================
-- SUBSCRIPTIONS TABLE
-- ============================================
create table public.subscriptions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  stripe_customer_id text,
  stripe_subscription_id text unique not null,
  stripe_price_id text,
  plan text not null check (plan in ('pro', 'agency')),
  status text not null default 'active' check (status in ('active', 'canceled', 'past_due', 'trialing')),
  current_period_start timestamptz,
  current_period_end timestamptz not null,
  cancel_at_period_end boolean default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz default now()
);

alter table public.subscriptions enable row level security;

create policy "Users can view their own subscriptions"
  on public.subscriptions for select
  using (auth.uid() = user_id);

-- ============================================
-- BRAND VOICES TABLE
-- ============================================
create table public.brand_voices (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  name text not null,
  samples text not null,
  description text,
  persona text,
  persona_generated_at timestamptz,
  samples_hash text,
  created_at timestamptz not null default now(),
  updated_at timestamptz default now()
);

alter table public.brand_voices enable row level security;

create policy "Users can view their own brand voices"
  on public.brand_voices for select
  using (auth.uid() = user_id);

create policy "Users can create their own brand voices"
  on public.brand_voices for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own brand voices"
  on public.brand_voices for update
  using (auth.uid() = user_id);

create policy "Users can delete their own brand voices"
  on public.brand_voices for delete
  using (auth.uid() = user_id);

-- ============================================
-- REPURPOSE JOBS TABLE
-- ============================================
create table public.repurpose_jobs (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  input_type text not null check (input_type in ('text', 'url', 'youtube', 'pdf')),
  input_content text not null,
  input_url text,
  brand_voice_id uuid references public.brand_voices(id) on delete set null,
  output_language text not null default 'en' check (output_language in ('en', 'hi', 'es', 'pt', 'fr')),
  created_at timestamptz not null default now()
);

alter table public.repurpose_jobs enable row level security;

create policy "Users can view their own jobs"
  on public.repurpose_jobs for select
  using (auth.uid() = user_id);

create policy "Users can create their own jobs"
  on public.repurpose_jobs for insert
  with check (auth.uid() = user_id);

-- ============================================
-- REPURPOSE OUTPUTS TABLE
-- ============================================
create table public.repurpose_outputs (
  id uuid primary key default uuid_generate_v4(),
  job_id uuid references public.repurpose_jobs(id) on delete cascade not null,
  platform text not null,
  generated_content text not null,
  edited_content text,
  created_at timestamptz not null default now()
);

alter table public.repurpose_outputs enable row level security;

create policy "Users can view outputs for their own jobs"
  on public.repurpose_outputs for select
  using (
    exists (
      select 1 from public.repurpose_jobs
      where repurpose_jobs.id = repurpose_outputs.job_id
      and repurpose_jobs.user_id = auth.uid()
    )
  );

-- ============================================
-- USAGE TABLE
-- ============================================
create table public.usage (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  month text not null,
  repurpose_count integer not null default 0,
  unique (user_id, month)
);

alter table public.usage enable row level security;

create policy "Users can view their own usage"
  on public.usage for select
  using (auth.uid() = user_id);

create policy "Users can insert their own usage"
  on public.usage for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own usage"
  on public.usage for update
  using (auth.uid() = user_id);

-- ============================================
-- CREATED POSTS TABLE (AI Content Starter)
-- ============================================
create table public.created_posts (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  topic text not null,
  tone text not null check (tone in ('professional', 'casual', 'humorous', 'inspirational', 'educational')),
  length text not null check (length in ('short', 'medium', 'long')),
  audience text not null,
  output_language text not null default 'en' check (output_language in ('en', 'hi', 'es', 'pt', 'fr')),
  generated_content text not null,
  brand_voice_id uuid references public.brand_voices(id) on delete set null,
  created_at timestamptz not null default now()
);

alter table public.created_posts enable row level security;

create policy "Users can view their own created posts"
  on public.created_posts for select
  using (auth.uid() = user_id);

create policy "Users can create their own posts"
  on public.created_posts for insert
  with check (auth.uid() = user_id);

-- ============================================
-- ATOMIC USAGE INCREMENT
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
-- CONNECTED ACCOUNTS TABLE (OAuth for posting)
-- ============================================
create table public.connected_accounts (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  platform text not null check (platform in ('linkedin', 'twitter', 'facebook', 'instagram', 'reddit')),
  platform_user_id text not null,
  platform_username text,
  platform_avatar text,
  access_token text not null,
  refresh_token text,
  token_expires_at timestamptz,
  scope text,
  meta jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz default now(),
  unique (user_id, platform)
);

alter table public.connected_accounts enable row level security;

create policy "Users can view their own connected accounts"
  on public.connected_accounts for select
  using (auth.uid() = user_id);

create policy "Users can insert their own connected accounts"
  on public.connected_accounts for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own connected accounts"
  on public.connected_accounts for update
  using (auth.uid() = user_id);

create policy "Users can delete their own connected accounts"
  on public.connected_accounts for delete
  using (auth.uid() = user_id);

-- ============================================
-- SCHEDULED POSTS TABLE
-- ============================================
create table public.scheduled_posts (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  connected_account_id uuid references public.connected_accounts(id) on delete cascade not null,
  output_id uuid references public.repurpose_outputs(id) on delete cascade not null,
  platform text not null,
  scheduled_at timestamptz not null,
  status text not null default 'pending' check (status in ('pending', 'completed', 'failed')),
  posted_at timestamptz,
  error_message text,
  created_at timestamptz not null default now()
);

alter table public.scheduled_posts enable row level security;

create policy "Users can view their own scheduled posts"
  on public.scheduled_posts for select
  using (auth.uid() = user_id);

create policy "Users can create their own scheduled posts"
  on public.scheduled_posts for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own scheduled posts"
  on public.scheduled_posts for update
  using (auth.uid() = user_id);

create policy "Users can delete their own scheduled posts"
  on public.scheduled_posts for delete
  using (auth.uid() = user_id);

-- ============================================
-- INDEXES
-- ============================================
create index idx_repurpose_jobs_user_id on public.repurpose_jobs(user_id);
create index idx_connected_accounts_user_id on public.connected_accounts(user_id);
create index idx_scheduled_posts_user_id on public.scheduled_posts(user_id);
create index idx_scheduled_posts_scheduled_at_status on public.scheduled_posts(scheduled_at, status);
create index idx_repurpose_jobs_created_at on public.repurpose_jobs(created_at desc);
create index idx_repurpose_outputs_job_id on public.repurpose_outputs(job_id);
create index idx_brand_voices_user_id on public.brand_voices(user_id);
create index idx_usage_user_month on public.usage(user_id, month);
create index idx_subscriptions_user_id on public.subscriptions(user_id);
create index idx_created_posts_user_id on public.created_posts(user_id);
create index idx_created_posts_created_at on public.created_posts(created_at desc);
