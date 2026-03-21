-- Keep legacy `sample_text` in sync for rows that predate `samples`, and allow both to be maintained by the app.
-- App writes the same value to `samples` and `sample_text` until `sample_text` is dropped.

UPDATE public.brand_voices
SET samples = sample_text
WHERE (samples IS NULL OR samples = '')
  AND sample_text IS NOT NULL
  AND length(trim(sample_text)) > 0;
