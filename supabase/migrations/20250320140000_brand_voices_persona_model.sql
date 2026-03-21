-- Records which model produced the cached persona (e.g. claude-3-5-haiku-20241022 or gpt-4o-mini).
ALTER TABLE public.brand_voices
  ADD COLUMN IF NOT EXISTS persona_model text;
