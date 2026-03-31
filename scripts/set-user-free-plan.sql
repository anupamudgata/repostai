-- =============================================================================
-- Force a user to the FREE plan (local or hosted Supabase)
-- =============================================================================
-- The app uses getEffectivePlan(): only active/trialing rows in public.subscriptions
-- grant paid tiers. profiles.plan is display/cache only.
--
-- Run: Supabase Dashboard → SQL → New query → paste → Run
--   or: supabase db execute --file scripts/set-user-free-plan.sql  (if linked)
--
-- Also ensure .env.local does NOT set:
--   SUPERUSER_EMAIL=aireposeai@gmail.com
-- (that env bypasses limits and shows as Pro with isSuperUser.)
-- =============================================================================

do $$
declare
  target_email constant text := 'aireposeai@gmail.com';
  uid uuid;
begin
  select u.id into uid
  from auth.users u
  where lower(trim(u.email)) = lower(trim(target_email))
  limit 1;

  if uid is null then
    raise notice 'No auth.users row for %. Sign up in the app first, then re-run.', target_email;
    return;
  end if;

  delete from public.subscriptions where user_id = uid;

  update public.profiles
  set plan = 'free', updated_at = now()
  where id = uid;

  if not found then
    raise notice 'Profile row missing for % — complete one login so ensure_profile runs, then re-run.', target_email;
  else
    raise notice 'Done: % (id %) — subscriptions cleared, profiles.plan = free.', target_email, uid;
  end if;
end $$;

-- Optional: confirm
-- select p.id, p.email, p.plan, s.plan as sub_plan, s.status
-- from public.profiles p
-- left join public.subscriptions s on s.user_id = p.id
-- where lower(trim(p.email)) = 'aireposeai@gmail.com';
