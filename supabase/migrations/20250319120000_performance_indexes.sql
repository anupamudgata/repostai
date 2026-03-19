-- Performance indexes for common query patterns
-- repurpose_jobs: dashboard lists by user, ordered by created_at
CREATE INDEX IF NOT EXISTS idx_repurpose_jobs_user_created
  ON public.repurpose_jobs(user_id, created_at DESC);

-- profiles: plan checks for free tier limits
CREATE INDEX IF NOT EXISTS idx_profiles_plan ON public.profiles(plan);

-- connected_accounts: token lookups by user + platform
CREATE INDEX IF NOT EXISTS idx_connected_accounts_user_platform
  ON public.connected_accounts(user_id, platform);
