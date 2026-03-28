# Scheduled posts on Vercel Hobby (external cron)

Vercel **Hobby** only allows **at most one cron invocation per day** for built-in Crons. A schedule like every 15 minutes is **not** allowed on Hobby, which blocks deployments if `vercel.json` defines such a cron.

This repo **does not** register a Vercel Cron in `vercel.json`. You should trigger [`/api/cron/scheduled-posts`](../src/app/api/cron/scheduled-posts/route.ts) from an **external scheduler** until you upgrade to **Vercel Pro** (then you can add a `crons` entry again if you prefer).

## 1. Environment variables (Vercel)

1. Generate a secret: `openssl rand -hex 32`
2. In **Vercel** → **Project** → **Settings** → **Environment Variables**, set **`CRON_SECRET`** to that value (Production, and Preview if needed).
3. Redeploy so the serverless function sees the variable.

## 2. Authentication

The endpoint requires **`CRON_SECRET`** to be set. Then either:

- **Preferred:** `Authorization: Bearer <CRON_SECRET>`
- **Fallback:** query string `?secret=<CRON_SECRET>` (easier for some free cron UIs; avoid sharing URLs because secrets can appear in logs)

If **`CRON_SECRET`** is unset, every request returns **401** (endpoint stays closed).

## 3. Option A — cron-job.org (or similar)

1. Create a cron job that runs every **5–15 minutes** (pick what you need).
2. **URL:** `https://YOUR_DOMAIN/api/cron/scheduled-posts`
3. **Method:** GET
4. **Header:** `Authorization: Bearer YOUR_CRON_SECRET` (if the product supports custom headers).
5. If it does **not** support headers, use  
   `https://YOUR_DOMAIN/api/cron/scheduled-posts?secret=YOUR_CRON_SECRET`  
   and accept the risk of the secret appearing in access logs.

## 4. Option B — GitHub Actions (this repo)

Workflow: [`.github/workflows/scheduled-posts-cron.yml`](../.github/workflows/scheduled-posts-cron.yml)

1. In the GitHub repo → **Settings** → **Secrets and variables** → **Actions**, add:
   - **`CRON_SECRET`** — same value as Vercel
   - **`CRON_TARGET_URL`** — production origin only, no trailing slash, e.g. `https://repostai-zeta.vercel.app`
2. The workflow runs on a **schedule** (every 15 minutes UTC) and can be run manually via **Actions** → **Scheduled posts cron** → **Run workflow**.

GitHub can delay scheduled runs by several minutes; for tighter timing use a dedicated cron service or Vercel Pro.

## 5. Option C — Supabase (advanced)

You can use **pg_cron** plus `pg_net` / HTTP extensions (if enabled on your plan) to `GET` your Vercel URL with a header or query secret. This is project-specific; see Supabase docs for `pg_cron` and HTTP from the database.

## 6. After upgrading to Vercel Pro

You may add back to `vercel.json`:

```json
"crons": [
  {
    "path": "/api/cron/scheduled-posts",
    "schedule": "*/15 * * * *"
  }
]
```

With **`CRON_SECRET`** set in Vercel, [Vercel Cron can send `Authorization: Bearer <CRON_SECRET>`](https://vercel.com/docs/cron-jobs) automatically (see their “Securing cron jobs” section). You can keep an external cron as backup or remove it.
