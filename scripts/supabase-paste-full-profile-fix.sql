-- =============================================================================
-- Paste into Supabase Dashboard → SQL Editor → New query → Run
-- Fixes missing public.profiles rows (repurpose FK / "profile isn't ready").
-- Safe to re-run: uses CREATE OR REPLACE, DROP IF EXISTS, ON CONFLICT DO NOTHING.
--
-- Production + local checklist (do both envs):
--   1) Run this entire script on the project (local Supabase or hosted).
--   2) Vercel / .env.local: SUPABASE_SERVICE_ROLE_KEY = service_role key (NOT anon).
--   3) Same Supabase URL + anon key as in the dashboard for that project.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1) RPC: create profile from JWT (app calls this as fallback)
-- -----------------------------------------------------------------------------
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

-- -----------------------------------------------------------------------------
-- 2) Trigger: auto-create profile on new auth user
-- -----------------------------------------------------------------------------
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

-- -----------------------------------------------------------------------------
-- 3) RLS: allow user-session inserts (fallback when service role fails)
-- -----------------------------------------------------------------------------
drop policy if exists "Users can insert their own profile" on public.profiles;
create policy "Users can insert their own profile"
  on public.profiles
  for insert
  with check (auth.uid() = id);

drop policy if exists "Users can insert their own jobs" on public.profiles;
drop policy if exists "Users can insert their own jobs" on public.repurpose_jobs;
create policy "Users can insert their own jobs"
  on public.repurpose_jobs
  for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can insert their own outputs" on public.repurpose_outputs;
create policy "Users can insert their own outputs"
  on public.repurpose_outputs
  for insert
  with check (
    exists (
      select 1 from public.repurpose_jobs j
      where j.id = job_id and j.user_id = auth.uid()
    )
  );

drop policy if exists "Users can insert their own usage" on public.usage;
create policy "Users can insert their own usage"
  on public.usage
  for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update their own usage" on public.usage;
create policy "Users can update their own usage"
  on public.usage
  for update
  using (auth.uid() = user_id);

-- -----------------------------------------------------------------------------
-- 4) Backfill: profiles for existing auth users with no row (idempotent)
-- -----------------------------------------------------------------------------
insert into public.profiles (id, email, name, avatar_url, market_region)
select
  u.id,
  coalesce(nullif(trim(u.email), ''), replace(u.id::text, '-', '') || '@users.repostai.local'),
  coalesce(u.raw_user_meta_data->>'full_name', u.raw_user_meta_data->>'name'),
  u.raw_user_meta_data->>'avatar_url',
  u.raw_user_meta_data->>'market_region'
from auth.users u
left join public.profiles p on u.id = p.id
where p.id is null
on conflict (id) do nothing;

-- -----------------------------------------------------------------------------
-- 5) Verify: expect 0 rows
-- -----------------------------------------------------------------------------
select u.id, u.email
from auth.users u
left join public.profiles p on p.id = u.id
where p.id is null;
