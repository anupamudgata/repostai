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
  ADD COLUMN IF NOT EXISTS persona               text,
  ADD COLUMN IF NOT EXISTS persona_generated_at  timestamptz,
  ADD COLUMN IF NOT EXISTS samples_hash          text;

CREATE INDEX IF NOT EXISTS brand_voices_user_id_idx ON public.brand_voices(user_id);


-- ── MIGRATION 4: Add stripe_customer_id to users ───────────
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS stripe_customer_id text,
  ADD COLUMN IF NOT EXISTS plan               text DEFAULT 'free';


-- ── VERIFY: Check all tables have RLS enabled ──────────────
SELECT schemaname, tablename, rowsecurity AS rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('users','repurpose_history','brand_voices','subscriptions','usage_tracking','connected_accounts')
ORDER BY tablename;
