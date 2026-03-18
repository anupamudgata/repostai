-- ============================================================
-- RepostAI — Complete Database Migrations
-- Run each section in Supabase SQL Editor in order
-- ============================================================


-- ── MIGRATION 1: Enable RLS on all tables ──────────────────
ALTER TABLE public.users             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.repurpose_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brand_voices      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_tracking    ENABLE ROW LEVEL SECURITY;

-- Drop old policies (safe to re-run)
DROP POLICY IF EXISTS "users_select_own"    ON public.users;
DROP POLICY IF EXISTS "users_update_own"    ON public.users;
DROP POLICY IF EXISTS "users_insert_own"    ON public.users;
DROP POLICY IF EXISTS "history_select_own"  ON public.repurpose_history;
DROP POLICY IF EXISTS "history_insert_own"  ON public.repurpose_history;
DROP POLICY IF EXISTS "history_delete_own"  ON public.repurpose_history;
DROP POLICY IF EXISTS "voices_select_own"   ON public.brand_voices;
DROP POLICY IF EXISTS "voices_insert_own"   ON public.brand_voices;
DROP POLICY IF EXISTS "voices_update_own"   ON public.brand_voices;
DROP POLICY IF EXISTS "voices_delete_own"   ON public.brand_voices;
DROP POLICY IF EXISTS "subs_select_own"     ON public.subscriptions;
DROP POLICY IF EXISTS "subs_insert_service" ON public.subscriptions;
DROP POLICY IF EXISTS "subs_update_service" ON public.subscriptions;
DROP POLICY IF EXISTS "usage_select_own"    ON public.usage_tracking;
DROP POLICY IF EXISTS "usage_insert_own"    ON public.usage_tracking;
DROP POLICY IF EXISTS "usage_update_own"    ON public.usage_tracking;

-- Users
CREATE POLICY "users_select_own" ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "users_update_own" ON public.users FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY "users_insert_own" ON public.users FOR INSERT WITH CHECK (auth.uid() = id);

-- Repurpose history
CREATE POLICY "history_select_own" ON public.repurpose_history FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "history_insert_own" ON public.repurpose_history FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "history_delete_own" ON public.repurpose_history FOR DELETE USING (auth.uid() = user_id);

-- Brand voices
CREATE POLICY "voices_select_own" ON public.brand_voices FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "voices_insert_own" ON public.brand_voices FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "voices_update_own" ON public.brand_voices FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "voices_delete_own" ON public.brand_voices FOR DELETE USING (auth.uid() = user_id);

-- Subscriptions (service role only for writes)
CREATE POLICY "subs_select_own"     ON public.subscriptions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "subs_insert_service" ON public.subscriptions FOR INSERT WITH CHECK (auth.role() = 'service_role');
CREATE POLICY "subs_update_service" ON public.subscriptions FOR UPDATE USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');

-- Usage tracking (service role only for writes)
CREATE POLICY "usage_select_own"   ON public.usage_tracking FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "usage_insert_own"   ON public.usage_tracking FOR INSERT WITH CHECK (auth.role() = 'service_role');
CREATE POLICY "usage_update_own"   ON public.usage_tracking FOR UPDATE USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');


-- ── MIGRATION 2: Connected accounts table (social posting) ─
CREATE TABLE IF NOT EXISTS public.connected_accounts (
  id                uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id           uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  platform          text NOT NULL,
  platform_user_id  text NOT NULL,
  platform_username text,
  platform_avatar   text,
  access_token      text NOT NULL,
  refresh_token     text,
  token_expires_at  timestamptz,
  scope             text,
  meta              jsonb,
  created_at        timestamptz DEFAULT now(),
  updated_at        timestamptz DEFAULT now(),
  UNIQUE(user_id, platform)
);

ALTER TABLE public.connected_accounts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "accounts_select_own" ON public.connected_accounts;
DROP POLICY IF EXISTS "accounts_insert_own" ON public.connected_accounts;
DROP POLICY IF EXISTS "accounts_update_own" ON public.connected_accounts;
DROP POLICY IF EXISTS "accounts_delete_own" ON public.connected_accounts;
CREATE POLICY "accounts_select_own" ON public.connected_accounts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "accounts_insert_own" ON public.connected_accounts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "accounts_update_own" ON public.connected_accounts FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "accounts_delete_own" ON public.connected_accounts FOR DELETE USING (auth.uid() = user_id);


-- ── MIGRATION 3: Brand voice persona cache columns ──────────
ALTER TABLE public.brand_voices
  ADD COLUMN IF NOT EXISTS samples               text,
  ADD COLUMN IF NOT EXISTS persona               text,
  ADD COLUMN IF NOT EXISTS persona_generated_at  timestamptz,
  ADD COLUMN IF NOT EXISTS samples_hash          text,
  ADD COLUMN IF NOT EXISTS updated_at            timestamptz DEFAULT now();

-- Copy sample_text → samples for existing rows (if sample_text exists)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'brand_voices' AND column_name = 'sample_text'
  ) THEN
    UPDATE public.brand_voices SET samples = sample_text WHERE (samples IS NULL OR samples = '') AND sample_text IS NOT NULL;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS brand_voices_user_id_idx ON public.brand_voices(user_id);


-- ── MIGRATION 4: Add stripe_customer_id to users ───────────
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS stripe_customer_id text,
  ADD COLUMN IF NOT EXISTS plan               text DEFAULT 'free';


-- ── MIGRATION 5: Post engagement (Content Performance Analytics) ─
CREATE TABLE IF NOT EXISTS public.post_engagement (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  scheduled_post_id uuid REFERENCES public.scheduled_posts(id) ON DELETE SET NULL,
  platform text NOT NULL CHECK (platform IN ('linkedin', 'twitter', 'twitter_thread', 'twitter_single', 'instagram', 'facebook')),
  content_preview text,
  posted_at timestamptz NOT NULL,
  likes integer NOT NULL DEFAULT 0,
  comments integer NOT NULL DEFAULT 0,
  shares integer NOT NULL DEFAULT 0,
  impressions integer NOT NULL DEFAULT 0,
  clicks integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.post_engagement ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "engagement_select_own" ON public.post_engagement;
DROP POLICY IF EXISTS "engagement_insert_own" ON public.post_engagement;
DROP POLICY IF EXISTS "engagement_update_own" ON public.post_engagement;
DROP POLICY IF EXISTS "engagement_delete_own" ON public.post_engagement;
CREATE POLICY "engagement_select_own" ON public.post_engagement FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "engagement_insert_own" ON public.post_engagement FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "engagement_update_own" ON public.post_engagement FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "engagement_delete_own" ON public.post_engagement FOR DELETE USING (auth.uid() = user_id);
CREATE INDEX IF NOT EXISTS idx_post_engagement_user_id ON public.post_engagement(user_id);
CREATE INDEX IF NOT EXISTS idx_post_engagement_posted_at ON public.post_engagement(posted_at DESC);


-- ── VERIFY: Check all tables have RLS enabled ──────────────
SELECT schemaname, tablename, rowsecurity AS rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('users','repurpose_history','brand_voices','subscriptions','usage_tracking','connected_accounts')
ORDER BY tablename;
