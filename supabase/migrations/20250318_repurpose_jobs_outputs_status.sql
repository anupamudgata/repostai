-- Add outputs (jsonb) and status to repurpose_jobs for update-after-generate pattern
-- outputs: stores [{ platform, content, type }] per job; default [] for new rows
ALTER TABLE public.repurpose_jobs
  ADD COLUMN IF NOT EXISTS outputs jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS status text DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed'));

-- Allow users to update their own jobs (for outputs + status)
DROP POLICY IF EXISTS "Users can update their own jobs" ON public.repurpose_jobs;
CREATE POLICY "Users can update their own jobs"
  ON public.repurpose_jobs FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
