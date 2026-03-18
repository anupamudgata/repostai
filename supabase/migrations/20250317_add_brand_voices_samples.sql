-- Fix: Add 'samples' column to brand_voices (code expects this; schema may have sample_text)
-- Run this in Supabase SQL Editor if you get: "Could not find the 'samples' column of 'brand_voices' in the schema cache"

ALTER TABLE public.brand_voices
  ADD COLUMN IF NOT EXISTS samples text,
  ADD COLUMN IF NOT EXISTS persona text,
  ADD COLUMN IF NOT EXISTS persona_generated_at timestamptz,
  ADD COLUMN IF NOT EXISTS samples_hash text,
  ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- Copy sample_text → samples for existing rows (if old schema had sample_text)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'brand_voices' AND column_name = 'sample_text'
  ) THEN
    UPDATE public.brand_voices SET samples = sample_text WHERE (samples IS NULL OR samples = '') AND sample_text IS NOT NULL;
  END IF;
END $$;
