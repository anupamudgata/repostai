-- pgcrypto: gen_random_uuid() on photo_*, razorpay_orders, etc.
-- increment_usage: explicit GRANT so PostgREST can call RPC as authenticated (some projects lack this).

create extension if not exists pgcrypto;

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
