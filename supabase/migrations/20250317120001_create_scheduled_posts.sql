-- scheduled_posts table (required by post_engagement migration)
-- Depends on: profiles, connected_accounts, repurpose_outputs

create table if not exists public.scheduled_posts (
  id uuid primary key default gen_random_uuid(),
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

drop policy if exists "Users can view their own scheduled posts" on public.scheduled_posts;
drop policy if exists "Users can create their own scheduled posts" on public.scheduled_posts;
drop policy if exists "Users can update their own scheduled posts" on public.scheduled_posts;
drop policy if exists "Users can delete their own scheduled posts" on public.scheduled_posts;

create policy "Users can view their own scheduled posts"
  on public.scheduled_posts for select using (auth.uid() = user_id);

create policy "Users can create their own scheduled posts"
  on public.scheduled_posts for insert with check (auth.uid() = user_id);

create policy "Users can update their own scheduled posts"
  on public.scheduled_posts for update using (auth.uid() = user_id);

create policy "Users can delete their own scheduled posts"
  on public.scheduled_posts for delete using (auth.uid() = user_id);

create index if not exists idx_scheduled_posts_user_id on public.scheduled_posts(user_id);
create index if not exists idx_scheduled_posts_scheduled_at_status on public.scheduled_posts(scheduled_at, status);
