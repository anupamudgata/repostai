-- repurpose_outputs: Add INSERT and UPDATE policies (fixes blank platform outputs in History)
-- Root cause: RLS blocked inserts; jobs were created but outputs were never saved.

-- INSERT: Allow users to add outputs for their own jobs
create policy "Users can insert outputs for their own jobs"
  on public.repurpose_outputs for insert
  with check (
    exists (
      select 1 from public.repurpose_jobs
      where repurpose_jobs.id = repurpose_outputs.job_id
      and repurpose_jobs.user_id = auth.uid()
    )
  );

-- UPDATE: Allow users to update outputs for their own jobs (regenerate)
create policy "Users can update outputs for their own jobs"
  on public.repurpose_outputs for update
  using (
    exists (
      select 1 from public.repurpose_jobs
      where repurpose_jobs.id = repurpose_outputs.job_id
      and repurpose_jobs.user_id = auth.uid()
    )
  );
