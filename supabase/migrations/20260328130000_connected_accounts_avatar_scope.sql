-- Add platform_avatar, scope, and meta columns to connected_accounts
-- These are referenced in code but not in the original migration.

ALTER TABLE public.connected_accounts
  ADD COLUMN IF NOT EXISTS platform_avatar text,
  ADD COLUMN IF NOT EXISTS scope text,
  ADD COLUMN IF NOT EXISTS meta jsonb;
