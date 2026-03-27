-- ============================================================================
-- RepostAI — Run AFTER the monolithic "Complete schema + migration" SQL
-- Paste this in Supabase SQL Editor once (idempotent).
--
-- Your monolith is missing vs the current app (see src/lib/validators/output-language.ts
-- and src/lib/supabase/ensure-profile.ts):
--
-- 1) output_language CHECK only allows 5 codes; the app sends mr, bn, te, kn, or, pa too.
-- 2) ensure_profile_from_auth() — JWT-based profile row creation (no service role required).
-- 3) pgcrypto — required for gen_random_uuid() on photo_* / post_engagement / razorpay_orders.
-- 4) GRANT EXECUTE on increment_usage — so authenticated clients can call the RPC from API routes.
-- ============================================================================

create extension if not exists pgcrypto;

-- Must run BEFORE adding CHECK: existing rows with unknown codes cause ERROR 23514.
-- Inspect first: select distinct output_language from public.repurpose_jobs order by 1;
update public.repurpose_jobs
set output_language = lower(trim(output_language))
where output_language is not null and output_language <> lower(trim(output_language));

update public.created_posts
set output_language = lower(trim(output_language))
where output_language is not null and output_language <> lower(trim(output_language));

update public.repurpose_jobs
set output_language = 'en'
where output_language is null
   or trim(output_language) = ''
   or output_language not in ('en', 'hi', 'mr', 'bn', 'te', 'kn', 'or', 'pa', 'es', 'pt', 'fr');

update public.created_posts
set output_language = 'en'
where output_language is null
   or trim(output_language) = ''
   or output_language not in ('en', 'hi', 'mr', 'bn', 'te', 'kn', 'or', 'pa', 'es', 'pt', 'fr');

-- Align with OUTPUT_LANGUAGE_VALUES in src/lib/validators/output-language.ts
alter table public.repurpose_jobs drop constraint if exists repurpose_jobs_output_language_check;
alter table public.repurpose_jobs add constraint repurpose_jobs_output_language_check
  check (output_language in ('en', 'hi', 'mr', 'bn', 'te', 'kn', 'or', 'pa', 'es', 'pt', 'fr'));

alter table public.created_posts drop constraint if exists created_posts_output_language_check;
alter table public.created_posts add constraint created_posts_output_language_check
  check (output_language in ('en', 'hi', 'mr', 'bn', 'te', 'kn', 'or', 'pa', 'es', 'pt', 'fr'));

-- Profile bootstrap for logged-in users (matches supabase/migrations/20260327180000_*.sql)
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

-- Recreate increment_usage (same body) and tighten EXECUTE — required for supabase.rpc from session
create or replace function public.increment_usage(p_user_id uuid, p_month text)
returns void as $$
begin
  insert into public.usage (user_id, month, repurpose_count)
  values (p_user_id, p_month, 1)
  on conflict (user_id, month)
  do update set repurpose_count = public.usage.repurpose_count + 1;
end;
$$ language plpgsql security definer
set search_path = public;

revoke all on function public.increment_usage(uuid, text) from public;
grant execute on function public.increment_usage(uuid, text) to authenticated;
grant execute on function public.increment_usage(uuid, text) to service_role;

-- Optional: OAuth users with no email would break handle_new_user (profiles.email NOT NULL)
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, name, avatar_url, market_region)
  values (
    new.id,
    coalesce(
      nullif(trim(new.email), ''),
      replace(new.id::text, '-', '') || '@users.repostai.local'
    ),
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'),
    new.raw_user_meta_data->>'avatar_url',
    new.raw_user_meta_data->>'market_region'
  );
  return new;
end;
$$ language plpgsql security definer
set search_path = public;
