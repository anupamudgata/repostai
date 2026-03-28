-- Fix rows that violate the expanded output_language CHECK (prevents 23514 on ADD CONSTRAINT).

update public.repurpose_jobs
set output_language = lower(trim(output_language))
where output_language is not null and output_language <> lower(trim(output_language));

update public.created_posts
set output_language = lower(trim(output_language))
where output_language is not null and output_language <> lower(trim(output_language));

update public.repurpose_jobs
set output_language = 'en'
where output_language is null
   or trim(output_language) = ''
   or output_language not in ('en', 'hi', 'mr', 'bn', 'te', 'kn', 'or', 'pa', 'es', 'pt', 'fr');

update public.created_posts
set output_language = 'en'
where output_language is null
   or trim(output_language) = ''
   or output_language not in ('en', 'hi', 'mr', 'bn', 'te', 'kn', 'or', 'pa', 'es', 'pt', 'fr');

alter table public.repurpose_jobs drop constraint if exists repurpose_jobs_output_language_check;
alter table public.repurpose_jobs add constraint repurpose_jobs_output_language_check
  check (output_language in ('en', 'hi', 'mr', 'bn', 'te', 'kn', 'or', 'pa', 'es', 'pt', 'fr'));

alter table public.created_posts drop constraint if exists created_posts_output_language_check;
alter table public.created_posts add constraint created_posts_output_language_check
  check (output_language in ('en', 'hi', 'mr', 'bn', 'te', 'kn', 'or', 'pa', 'es', 'pt', 'fr'));
