-- Allow users to delete their own repurpose jobs (cascades to repurpose_outputs per FK).
drop policy if exists "Users can delete their own jobs" on public.repurpose_jobs;
create policy "Users can delete their own jobs"
  on public.repurpose_jobs for delete
  using (auth.uid() = user_id);
