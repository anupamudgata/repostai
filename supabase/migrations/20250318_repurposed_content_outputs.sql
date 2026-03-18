-- Optional: If your schema uses repurposed_content instead of repurpose_jobs
-- Check: SELECT column_name, data_type FROM information_schema.columns
--       WHERE table_name = 'repurposed_content' AND column_name = 'outputs';

-- Add outputs column if missing
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'repurposed_content')
     AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'repurposed_content' AND column_name = 'outputs')
  THEN
    ALTER TABLE public.repurposed_content ADD COLUMN outputs jsonb DEFAULT '[]'::jsonb;
  END IF;
END $$;
