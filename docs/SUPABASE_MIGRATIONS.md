# Migrating your Supabase (Postgres) database

This repo’s schema changes live in `supabase/migrations/*.sql`. Apply them either **locally** (Docker) or **on the hosted project** (dashboard or CLI).

## 1. Local database (Docker)

Requires [Docker Desktop](https://www.docker.com/products/docker-desktop/) and Supabase CLI.

```bash
npm run db:start    # first time pulls images & starts Postgres
npm run db:reset    # reapplies every migration from scratch (wipes local data)
```

For day-to-day dev, `db:reset` is the reliable “migrate my local DB” command.

## 2. Hosted project (production / cloud) — CLI

### One-time: link the repo to your project

```bash
npx supabase login
npx supabase link --project-ref YOUR_PROJECT_REF
```

`YOUR_PROJECT_REF` is the id in the Supabase dashboard URL:  
`https://supabase.com/dashboard/project/<project-ref>`.

### Push pending migrations

Your **database password** is **not** the anon or service-role key. Get it from:

**Project Settings → Database → Database password** (reset it if you don’t have it).

Non-interactive push:

```bash
export SUPABASE_DB_PASSWORD='your-database-password'
npm run db:push:remote
```

Or manually:

```bash
export SUPABASE_DB_PASSWORD='your-database-password'
npx supabase db push --linked
```

### If you see: “Remote migration versions not found in local migrations directory”

The remote `schema_migrations` table lists versions that don’t match files in this repo. Until that’s fixed, `db push` will refuse to run.

1. Inspect differences:

   ```bash
   export SUPABASE_DB_PASSWORD='your-database-password'
   npx supabase migration list --linked
   ```

2. Fix using one of:
   - Restore missing migration files (same timestamp names) from git or another machine.
   - Or `npx supabase migration repair --status reverted <VERSION>` for bogus remote-only rows (use the **full** version from the list, e.g. `20250317120000`).

3. Or apply **only** the SQL you need in **SQL Editor** (e.g. the delete policy in `20250320150000_repurpose_outputs_delete_policy.sql`).

## 3. Hosted project — no CLI (SQL Editor)

1. Open **SQL → New query** in the Supabase dashboard.
2. Paste the contents of the migration file(s) you still need, **in timestamp order** (oldest first), and run.

Skip statements that already exist if the editor reports “already exists” errors, or add `IF NOT EXISTS` / `DROP … IF EXISTS` only when you know it’s safe.

## Migration files (current)

| File | Purpose (short) |
|------|-------------------|
| `20250312_repurpose_outputs_rls.sql` | RLS on `repurpose_outputs` |
| `20250317_add_brand_voices_samples.sql` | Brand voice samples |
| `20250317120000_connected_accounts.sql` | Connected accounts |
| `20250317120001_create_scheduled_posts.sql` | Scheduled posts |
| `20250317120002_post_engagement.sql` | Post engagement |
| `20250318120001_repurpose_jobs_outputs_status.sql` | Jobs outputs/status |
| `20250318120002_repurposed_content_outputs.sql` | Repurposed content note |
| `20250318_brand_voice_authenticity_tuning.sql` | Brand voice tuning |
| `20250319120000_performance_indexes.sql` | Indexes |
| `20250320130000_brand_voices_legacy_sample_text.sql` | Brand voices legacy |
| `20250320140000_brand_voices_persona_model.sql` | Persona model |
| `20250320150000_repurpose_outputs_delete_policy.sql` | **DELETE policy for history** |
