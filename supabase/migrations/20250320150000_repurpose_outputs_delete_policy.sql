-- Allow users to delete individual outputs (history rows) for their own jobs.
create policy "Users can delete outputs for their own jobs"
  on public.repurpose_outputs for delete
  using (
    exists (
      select 1 from public.repurpose_jobs
      where repurpose_jobs.id = repurpose_outputs.job_id
      and repurpose_jobs.user_id = auth.uid()
    )
  );
