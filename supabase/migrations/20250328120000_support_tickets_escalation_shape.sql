-- Align support_tickets with escalation workflow: needs_human / urgency / transcript (JSON text)

-- 1) New columns (id stays uuid — equivalent to Prisma String @id; cuid optional in app layer)
alter table public.support_tickets
  add column if not exists urgency text,
  add column if not exists transcript text;

update public.support_tickets
set urgency = 'medium'
where urgency is null;

update public.support_tickets
set transcript = coalesce(transcript_snapshot::text, '[]')
where transcript is null;

alter table public.support_tickets
  alter column urgency set default 'medium',
  alter column urgency set not null,
  alter column transcript set not null;

alter table public.support_tickets
  drop constraint if exists support_tickets_urgency_check;

alter table public.support_tickets
  add constraint support_tickets_urgency_check
  check (urgency in ('low', 'medium', 'high'));

-- 2) Status: replace 'open' with 'needs_human' (queue semantics)
alter table public.support_tickets
  drop constraint if exists support_tickets_status_check;

update public.support_tickets
set status = 'needs_human'
where status = 'open';

alter table public.support_tickets
  add constraint support_tickets_status_check
  check (status in ('needs_human', 'in_progress', 'resolved'));

alter table public.support_tickets
  alter column status set default 'needs_human';
