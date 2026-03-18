-- Authenticity Tuning for Brand Voice
-- humanization_level: 'casual' | 'professional' | 'raw' (slider: Casual ↔ Professional ↔ Raw/Unfiltered)
-- imperfection_mode: when true, AI adds typos, fragments, lowercase for vibe
-- personal_story_injection: when true, AI auto-generates relevant personal anecdotes

ALTER TABLE public.brand_voices
  ADD COLUMN IF NOT EXISTS humanization_level text DEFAULT 'professional',
  ADD COLUMN IF NOT EXISTS imperfection_mode boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS personal_story_injection boolean DEFAULT false;
