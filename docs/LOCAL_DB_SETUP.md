# Local Database Setup (Supabase)

Run a full Supabase stack locally: Postgres, Auth, Storage, Studio.

## Prerequisites

1. **Docker Desktop** — [Install](https://docs.docker.com/desktop/)
   - On macOS: [Docker Desktop for Mac](https://docs.docker.com/desktop/install/mac-install/)
   - Alternative: [OrbStack](https://orbstack.dev/) or [Colima](https://github.com/abiosoft/colima)

2. **Node.js 20+** — You already have this for Next.js

## Quick Start

```bash
# 1. Start Docker Desktop (must be running)

# 2. Start local Supabase
./scripts/start-local-db.sh

# Or manually:
npx supabase start
```

## After Start

1. **Get local credentials:**
   ```bash
   npx supabase status
   ```

2. **Update `.env.local`** with the output:
   ```
   NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
   NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon key from status>
   SUPABASE_SERVICE_ROLE_KEY=<service_role key from status>
   ```

3. **Run schema** — Option A: Supabase Studio
   - Open http://localhost:54323
   - SQL Editor → paste `docs/DATABASE_SCHEMA.sql` + `SCHEMA_FIXES.sql` → Run

   Option B: CLI
   ```bash
   npx supabase db reset   # Applies migrations from supabase/migrations/
   ```

## Useful Commands

| Command | Description |
|---------|-------------|
| `npx supabase start` | Start local Supabase |
| `npx supabase stop` | Stop local Supabase |
| `npx supabase status` | Show URLs and keys |
| `npx supabase db reset` | Reset DB and run migrations |
| `npx supabase db push` | Push migrations to linked remote |

## Studio

- **URL:** http://localhost:54323
- **Login:** (no auth for local)
- Use SQL Editor to run `docs/DATABASE_SCHEMA.sql` and `SCHEMA_FIXES.sql` if migrations don't cover everything

## Troubleshooting

**"Cannot connect to Docker daemon"**
- Start Docker Desktop and wait until it's fully running

**"Docker not found"**
- Install Docker Desktop or OrbStack

**Migrations fail**
- Run base schema first: `docs/DATABASE_SCHEMA.sql`
- Then `SCHEMA_FIXES.sql`
- Then any `supabase/migrations/*.sql` not already in the base schema
