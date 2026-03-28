# Vercel deployment troubleshooting

Use this guide when the app works locally but has issues on Vercel (same old page, wrong redirect after login, landing/dashboard not loading, or cron errors).

---

## 1. Same old page / nothing changes after deploy

**Cause:** Old build is cached, or you’re opening an old deployment URL.

**Fix:**

- Open the **latest** deployment: **Vercel** → **Deployments** → top deployment → **Visit**.
- Or use the **stable branch URL**: `https://<project>-git-<branch>-<scope>.vercel.app` (e.g. `repostai-git-main-anupamudgatas-projects.vercel.app`).
- **Hard refresh:** **Ctrl+Shift+R** (Windows) or **Cmd+Shift+R** (Mac), or test in **incognito**.
- Env vars are applied at **build** time. After changing **Environment Variables**, trigger a **Redeploy** (Deployments → ⋯ → Redeploy).

---

## 2. Wrong redirect or blank page after login

**Cause:** Supabase doesn’t allow your Vercel URL, or session/cookies don’t match the domain.

**Fix:**

1. **Supabase** → **Authentication** → **URL Configuration**:
   - **Redirect URLs:** Add the **exact** URL you use in the browser, e.g. `https://repostai-xxx-anupamudgatas-projects.vercel.app/**`.
   - **Site URL (optional):** Set to that same base URL so Supabase uses it as the default redirect target.
2. Use the **same** deployment URL when logging in and when opening the app (don’t mix localhost and Vercel in one flow).
3. The app’s auth callback redirects to the **same host** that received the callback; ensure that host is in Supabase **Redirect URLs**.

---

## 3. Landing page not showing / wrong page at root

- The **landing page** is only at the **root**: `https://your-app.vercel.app/` (no path).
- If you open `.../dashboard` or `.../dashboard/history` you see the dashboard, not the landing.
- Set **NEXT_PUBLIC_APP_URL** in Vercel to your app’s base URL (e.g. `https://your-app.vercel.app`) if you use it for OAuth or links elsewhere.

---

## 4. Dashboard or features missing (Connections, Post now, etc.)

**Cause:** Missing or incorrect env vars on Vercel.

**Fix:**

- In **Vercel** → **Settings** → **Environment Variables**, set at least:
  - **NEXT_PUBLIC_SUPABASE_URL**, **NEXT_PUBLIC_SUPABASE_ANON_KEY**, **SUPABASE_SERVICE_ROLE_KEY**
  - **NEXT_PUBLIC_APP_URL** (your Vercel app URL)
- For **Connections** (LinkedIn/Twitter): add **LINKEDIN_CLIENT_ID**, **LINKEDIN_CLIENT_SECRET**, **TWITTER_CLIENT_ID**, **TWITTER_CLIENT_SECRET**, and add the matching redirect URLs in LinkedIn/Twitter app settings.
- **Redeploy** after adding or changing env vars.

---

## 5. Cron job error: “Hobby accounts are limited to daily cron jobs”

**Cause:** Vercel Hobby allows only **one built-in Cron invocation per day**. Schedules like every 15 minutes **fail validation** on deploy.

**Fix:**

- This repo **omits** `crons` from `vercel.json` so Hobby deploys succeed. Use an **external scheduler** (cron-job.org, GitHub Actions, etc.) to `GET` `/api/cron/scheduled-posts` with **`CRON_SECRET`**. See **[EXTERNAL_CRON_SCHEDULED_POSTS.md](./EXTERNAL_CRON_SCHEDULED_POSTS.md)**.
- After upgrading to **Vercel Pro**, you can add a `crons` entry back to `vercel.json` if you want Vercel-native scheduling again.

---

## 6. Build fails or env not applied

- **Redeploy** after changing env vars (they are baked in at build time).
- Check **Vercel** → **Deployments** → failed deployment → **Build Logs** for errors.
- Ensure **Production Branch** in **Settings** → **Git** is the branch you push (e.g. `main` or `dev`).

---

## Quick checklist

| Issue | Check |
|-------|--------|
| Same old page | Open latest deployment URL; hard refresh; redeploy after env change. |
| Login redirect wrong | Add Vercel URL to Supabase **Redirect URLs**; optionally set **Site URL**. |
| Landing not at root | Open `https://your-app.vercel.app/` (no path). |
| Features missing | Set env vars in Vercel (Supabase, NEXT_PUBLIC_APP_URL, etc.); redeploy. |
| Cron rejected | Use external cron + `CRON_SECRET` (see EXTERNAL_CRON_SCHEDULED_POSTS.md), or Vercel Pro + `vercel.json` crons. |

See **docs/ENV_VARS_CHECKLIST.md** for the full list of environment variables.

---

## 7. Brand voice error: "Could not find the 'samples' column of 'brand_voices'"

**Cause:** The database has `sample_text` (old schema) but the app expects `samples`.

**Fix:** Run this migration in **Supabase** → **SQL Editor**:

```sql
ALTER TABLE public.brand_voices
  ADD COLUMN IF NOT EXISTS samples text,
  ADD COLUMN IF NOT EXISTS persona text,
  ADD COLUMN IF NOT EXISTS persona_generated_at timestamptz,
  ADD COLUMN IF NOT EXISTS samples_hash text,
  ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'brand_voices' AND column_name = 'sample_text'
  ) THEN
    UPDATE public.brand_voices SET samples = sample_text WHERE (samples IS NULL OR samples = '') AND sample_text IS NOT NULL;
  END IF;
END $$;
```

Or run the full migration file: `supabase/migrations/20250317000001_add_brand_voices_samples.sql`.

---

## 8. Content Performance Analytics (post_engagement table)

**Cause:** The Analytics page requires the `post_engagement` table to track likes, comments, shares per post.

**Fix:** Run **MIGRATION 5** from `MIGRATIONS.sql` in Supabase SQL Editor, or run `supabase/migrations/20250317_post_engagement.sql`.
