-- ============================================
-- RepostAI Database Schema
-- Run this in your Supabase SQL Editor
-- ============================================

-- Enable UUID extension
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
  insert into public.profiles (id, email, name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'),
    new.raw_user_meta_data->>'avatar_url'
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
  stripe_subscription_id text unique not null,
  plan text not null check (plan in ('pro', 'agency')),
  status text not null default 'active' check (status in ('active', 'canceled', 'past_due', 'trialing')),
  current_period_end timestamptz not null,
  created_at timestamptz not null default now()
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
  sample_text text not null,
  description text,
  created_at timestamptz not null default now()
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
-- USAGE TRACKING TABLE
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
-- INDEXES FOR PERFORMANCE
-- ============================================
create index idx_repurpose_jobs_user_id on public.repurpose_jobs(user_id);
create index idx_repurpose_jobs_created_at on public.repurpose_jobs(created_at desc);
create index idx_repurpose_outputs_job_id on public.repurpose_outputs(job_id);
create index idx_brand_voices_user_id on public.brand_voices(user_id);
create index idx_usage_user_month on public.usage(user_id, month);
create index idx_subscriptions_user_id on public.subscriptions(user_id);
