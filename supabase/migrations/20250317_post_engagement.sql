-- Content Performance Analytics: post_engagement table
-- Tracks likes, comments, shares, impressions per post for AI-driven insights

create table if not exists public.post_engagement (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  scheduled_post_id uuid references public.scheduled_posts(id) on delete set null,
  platform text not null check (platform in ('linkedin', 'twitter', 'twitter_thread', 'twitter_single', 'instagram', 'facebook')),
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

alter table public.post_engagement enable row level security;

create policy "Users can view their own engagement"
  on public.post_engagement for select using (auth.uid() = user_id);

create policy "Users can insert their own engagement"
  on public.post_engagement for insert with check (auth.uid() = user_id);

create policy "Users can update their own engagement"
  on public.post_engagement for update using (auth.uid() = user_id);

create policy "Users can delete their own engagement"
  on public.post_engagement for delete using (auth.uid() = user_id);

create index idx_post_engagement_user_id on public.post_engagement(user_id);
create index idx_post_engagement_posted_at on public.post_engagement(posted_at desc);
create index idx_post_engagement_platform on public.post_engagement(platform);
