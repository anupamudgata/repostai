-- ============================================
-- RepostAI — Schema Fixes
-- Run in Supabase SQL Editor. Safe to run multiple times.
-- Fixes: scheduled_posts (cron compatibility), status values, missing columns
-- ============================================

-- ── 1. scheduled_posts: Add status values for cron (processing, published) ──
-- Cron uses: pending → processing → published/failed. Schema only had pending, completed, failed.
ALTER TABLE public.scheduled_posts
  DROP CONSTRAINT IF EXISTS scheduled_posts_status_check;

ALTER TABLE public.scheduled_posts
  ADD CONSTRAINT scheduled_posts_status_check
  CHECK (status IN ('pending', 'scheduled', 'processing', 'completed', 'published', 'failed'));

-- ── 2. scheduled_posts: Add columns for cron (content, content_segments, platforms, subreddit) ──
-- Schedule API inserts one row per platform with output_id. Cron can fetch content from repurpose_outputs
-- OR use content/content_segments when populated. Adding columns for flexibility.
ALTER TABLE public.scheduled_posts
  ADD COLUMN IF NOT EXISTS content text,
  ADD COLUMN IF NOT EXISTS content_segments jsonb,
  ADD COLUMN IF NOT EXISTS platforms text[],
  ADD COLUMN IF NOT EXISTS subreddit text;

-- ── 3. subscriptions: Ensure Razorpay columns exist ──
ALTER TABLE public.subscriptions
  ADD COLUMN IF NOT EXISTS stripe_customer_id text,
  ADD COLUMN IF NOT EXISTS stripe_price_id text,
  ADD COLUMN IF NOT EXISTS current_period_start timestamptz,
  ADD COLUMN IF NOT EXISTS cancel_at_period_end boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- ── 4. connected_accounts: Relax platform check (facebook, instagram, reddit for cron) ──
ALTER TABLE public.connected_accounts
  DROP CONSTRAINT IF EXISTS connected_accounts_platform_check;

ALTER TABLE public.connected_accounts
  ADD CONSTRAINT connected_accounts_platform_check
  CHECK (platform IN ('twitter', 'linkedin', 'facebook', 'instagram', 'reddit'));

-- ── 5. repurpose_outputs: Ensure INSERT/UPDATE policies exist (from 20250312) ──
DROP POLICY IF EXISTS "Users can insert outputs for their own jobs" ON public.repurpose_outputs;
CREATE POLICY "Users can insert outputs for their own jobs"
  ON public.repurpose_outputs FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.repurpose_jobs
      WHERE repurpose_jobs.id = repurpose_outputs.job_id
      AND repurpose_jobs.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can update outputs for their own jobs" ON public.repurpose_outputs;
CREATE POLICY "Users can update outputs for their own jobs"
  ON public.repurpose_outputs FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.repurpose_jobs
      WHERE repurpose_jobs.id = repurpose_outputs.job_id
      AND repurpose_jobs.user_id = auth.uid()
    )
  );

-- ── 6. repurpose_jobs: outputs + status (if missing from 20250318120001) ──
ALTER TABLE public.repurpose_jobs
  ADD COLUMN IF NOT EXISTS outputs jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS status text DEFAULT 'pending';

-- Drop old check if exists, add new one
ALTER TABLE public.repurpose_jobs
  DROP CONSTRAINT IF EXISTS repurpose_jobs_status_check;

ALTER TABLE public.repurpose_jobs
  ADD CONSTRAINT repurpose_jobs_status_check
  CHECK (status IN ('pending', 'completed', 'failed'));

-- ── 7. brand_voices: Ensure all columns (from migrations) ──
ALTER TABLE public.brand_voices
  ADD COLUMN IF NOT EXISTS samples text,
  ADD COLUMN IF NOT EXISTS persona text,
  ADD COLUMN IF NOT EXISTS persona_generated_at timestamptz,
  ADD COLUMN IF NOT EXISTS samples_hash text,
  ADD COLUMN IF NOT EXISTS humanization_level text DEFAULT 'professional',
  ADD COLUMN IF NOT EXISTS imperfection_mode boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS personal_story_injection boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- Copy sample_text → samples for existing rows (if old schema)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'brand_voices' AND column_name = 'sample_text'
  ) THEN
    UPDATE public.brand_voices SET samples = sample_text
    WHERE (samples IS NULL OR samples = '') AND sample_text IS NOT NULL;
  END IF;
END $$;

-- ── 8. profiles: Ensure market_region exists ──
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS market_region text;

-- ============================================
-- Done. Cron note: Update cron to use status = 'pending' (not 'scheduled')
-- since schedule API inserts status = 'pending'. Cron should fetch content
-- from repurpose_outputs via output_id when content/content_segments empty.
-- ============================================
