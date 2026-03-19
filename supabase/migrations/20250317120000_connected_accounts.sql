-- connected_accounts table (required by scheduled_posts)
-- Depends on: profiles

create table if not exists public.connected_accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  platform text not null check (platform in ('twitter', 'linkedin')),
  access_token text not null,
  refresh_token text,
  platform_username text,
  platform_user_id text,
  token_expires_at timestamptz,
  updated_at timestamptz default now(),
  created_at timestamptz not null default now(),
  unique (user_id, platform)
);

alter table public.connected_accounts enable row level security;

drop policy if exists "Users can view their own connected accounts" on public.connected_accounts;
drop policy if exists "Users can insert their own connected accounts" on public.connected_accounts;
drop policy if exists "Users can update their own connected accounts" on public.connected_accounts;
drop policy if exists "Users can delete their own connected accounts" on public.connected_accounts;

create policy "Users can view their own connected accounts"
  on public.connected_accounts for select using (auth.uid() = user_id);

create policy "Users can insert their own connected accounts"
  on public.connected_accounts for insert with check (auth.uid() = user_id);

create policy "Users can update their own connected accounts"
  on public.connected_accounts for update using (auth.uid() = user_id);

create policy "Users can delete their own connected accounts"
  on public.connected_accounts for delete using (auth.uid() = user_id);

create index if not exists idx_connected_accounts_user_id on public.connected_accounts(user_id);
