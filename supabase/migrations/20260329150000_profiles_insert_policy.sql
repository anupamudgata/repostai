-- Allow authenticated users to insert their own profile row.
-- Without this policy, the user-session fallback in ensureProfileForUser
-- silently fails because RLS blocks the INSERT.
-- The admin / service-role path bypasses RLS, but if that path is
-- unavailable (wrong key, network issue, etc.) users hit
-- "Your account profile isn't ready yet" every time.

-- INSERT: a user may create only their own row (id must match auth.uid())
drop policy if exists "Users can insert their own profile" on public.profiles;
create policy "Users can insert their own profile"
  on public.profiles
  for insert
  with check (auth.uid() = id);

-- Also add a missing INSERT policy for repurpose_jobs so the user-session
-- fallback in insertRepurposeJobWithFallback actually works.
drop policy if exists "Users can insert their own jobs" on public.profiles;
drop policy if exists "Users can insert their own jobs" on public.repurpose_jobs;
create policy "Users can insert their own jobs"
  on public.repurpose_jobs
  for insert
  with check (auth.uid() = user_id);

-- And for repurpose_outputs (the user-session may need to insert these too)
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

-- And for usage table (increment_usage RPC uses SECURITY DEFINER, but just in case)
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
