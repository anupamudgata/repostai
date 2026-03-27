-- Lets the API create a missing profiles row using the user's JWT (no service role required).
-- SECURITY DEFINER reads auth.users for email/metadata; insert bypasses RLS safely for self only.

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
