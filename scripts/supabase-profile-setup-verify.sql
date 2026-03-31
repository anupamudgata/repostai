-- Run in Supabase SQL Editor (hosted project) to diagnose and fix missing profiles.
-- See also: supabase/migrations/20260327180000_ensure_profile_from_auth_rpc.sql
--           supabase/migrations/20260329140000_handle_new_user_trigger.sql
--           supabase/migrations/20260329150000_profiles_insert_policy.sql

-- 1) RPC present?
select routine_schema, routine_name
from information_schema.routines
where routine_schema = 'public'
  and routine_name = 'ensure_profile_from_auth';

-- 2) Trigger on auth.users (Supabase: event_object_schema is often 'auth')
select trigger_schema, trigger_name, event_object_schema, event_object_table
from information_schema.triggers
where trigger_name = 'on_auth_user_created';

-- 3) Orphan auth users (should be 0 after backfill)
select u.id, u.email
from auth.users u
left join public.profiles p on p.id = u.id
where p.id is null;

-- 4) Backfill: create profiles for any auth user still missing one (idempotent)
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

-- 5) Re-check orphans (expected: 0 rows)
select u.id, u.email
from auth.users u
left join public.profiles p on p.id = u.id
where p.id is null;
