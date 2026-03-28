-- Auto-create a profiles row whenever a new auth user is created.
-- Without this trigger, new free users have no profiles row and hit a FK
-- error ("profile isn't ready") when they first try to repurpose.
-- The ensure_profile_from_auth RPC (20260327180000) is a belt-AND-suspenders
-- fallback, but the trigger is the primary safety net.

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
