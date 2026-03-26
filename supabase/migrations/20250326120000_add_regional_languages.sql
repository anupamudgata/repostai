-- Add regional Indian language codes to output_language constraints
-- New codes: mr (Marathi), bn (Bengali), te (Telugu), kn (Kannada), or (Odia), pa (Punjabi)

alter table public.repurpose_jobs drop constraint if exists repurpose_jobs_output_language_check;
alter table public.repurpose_jobs add constraint repurpose_jobs_output_language_check
  check (output_language in ('en', 'hi', 'mr', 'bn', 'te', 'kn', 'or', 'pa', 'es', 'pt', 'fr'));

alter table public.created_posts drop constraint if exists created_posts_output_language_check;
alter table public.created_posts add constraint created_posts_output_language_check
  check (output_language in ('en', 'hi', 'mr', 'bn', 'te', 'kn', 'or', 'pa', 'es', 'pt', 'fr'));
