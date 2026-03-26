-- RepostAI support widget: persistent chat + human escalation tickets

create table if not exists public.chat_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  status text not null default 'open' check (status in ('open', 'needs_human', 'closed')),
  title text,
  last_message_at timestamptz not null default now(),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.chat_messages (
  id text primary key,
  session_id uuid not null references public.chat_sessions (id) on delete cascade,
  role text not null check (role in ('user', 'assistant', 'system', 'tool')),
  content text not null default '',
  parts jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.support_tickets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  session_id uuid not null references public.chat_sessions (id) on delete cascade,
  status text not null default 'open' check (status in ('open', 'in_progress', 'resolved')),
  reason text,
  transcript_summary text,
  transcript_snapshot jsonb not null default '[]'::jsonb,
  user_email text,
  admin_notes text,
  notified_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_chat_sessions_user_last
  on public.chat_sessions (user_id, last_message_at desc);

create index if not exists idx_chat_messages_session_created
  on public.chat_messages (session_id, created_at asc);

create index if not exists idx_support_tickets_user_id on public.support_tickets (user_id);
create index if not exists idx_support_tickets_session_id on public.support_tickets (session_id);
create index if not exists idx_support_tickets_status_created
  on public.support_tickets (status, created_at desc);

alter table public.chat_sessions enable row level security;
alter table public.chat_messages enable row level security;
alter table public.support_tickets enable row level security;

create policy "Users manage own chat_sessions"
  on public.chat_sessions
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users read own chat_messages"
  on public.chat_messages
  for select
  using (
    exists (
      select 1 from public.chat_sessions s
      where s.id = chat_messages.session_id and s.user_id = auth.uid()
    )
  );

create policy "Users insert own chat_messages"
  on public.chat_messages
  for insert
  with check (
    exists (
      select 1 from public.chat_sessions s
      where s.id = chat_messages.session_id and s.user_id = auth.uid()
    )
  );

create policy "Users update own chat_messages"
  on public.chat_messages
  for update
  using (
    exists (
      select 1 from public.chat_sessions s
      where s.id = chat_messages.session_id and s.user_id = auth.uid()
    )
  );

create policy "Users select own support_tickets"
  on public.support_tickets
  for select
  using (auth.uid() = user_id);

create policy "Users insert own support_tickets"
  on public.support_tickets
  for insert
  with check (auth.uid() = user_id);

create policy "Users update own support_tickets"
  on public.support_tickets
  for update
  using (auth.uid() = user_id);
