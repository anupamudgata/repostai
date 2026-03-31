# RepostAI — Environment Variables Checklist

Use this list to configure **local** (`.env.local`) and **production** (e.g. Vercel). Copy `.env.example` to `.env.local` and fill in values.

---

## Required for core app

| Variable | Description | Get it from |
|----------|-------------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | Supabase Dashboard → Project Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key | Same as above |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key (server-only) | Same as above |

**Use the same Supabase project for URL, anon, and service role.** On Vercel, `SUPABASE_SERVICE_ROLE_KEY` must come from **Project Settings → API** for the project whose URL is in `NEXT_PUBLIC_SUPABASE_URL`. A key from a different project causes profile creation and `repurpose_jobs` inserts to fail in subtle ways.
| `OPENAI_API_KEY` | OpenAI API key | https://platform.openai.com/api-keys |
| `NEXT_PUBLIC_APP_URL` | App URL (e.g. `https://repostai.com` or `http://localhost:3000`) | You set this |

**Supabase Redirect URLs (required for login on Vercel)**  
In **Supabase Dashboard** → **Authentication** → **URL Configuration** → **Redirect URLs**, add every URL where the app runs, for example:
- `http://localhost:3000/**` (local)
- `https://your-app.vercel.app/**` (production)
- `https://repostai-p0nfkgytw-anupamudgatas-projects.vercel.app/**` (each Vercel preview URL, or use a wildcard if your plan allows)

If the Vercel URL is missing, login can redirect to the wrong place or the dashboard may not load correctly after sign-in.

---

## Rate limiting (Upstash)

| Variable | Description | Get it from |
|----------|-------------|-------------|
| `UPSTASH_REDIS_REST_URL` | Upstash Redis REST URL | https://console.upstash.com → Create database → REST API |
| `UPSTASH_REDIS_REST_TOKEN` | Upstash Redis REST token | Same as above |

---

## Stripe (billing, portal, webhooks)

| Variable | Description | Get it from |
|----------|-------------|-------------|
| `STRIPE_SECRET_KEY` | Secret key (use `sk_live_` for production) | Stripe Dashboard → Developers → API keys |
| `STRIPE_WEBHOOK_SECRET` | Webhook signing secret | Stripe Dashboard → Developers → Webhooks → Add endpoint → Signing secret |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Publishable key (client) | Same as API keys |
| `STRIPE_PRO_MONTHLY_PRICE_ID` | Pro monthly Price ID | Stripe Dashboard → Products → your Pro product → Price ID |
| `STRIPE_PRO_ANNUAL_PRICE_ID` | Pro annual Price ID | Same |
| `STRIPE_AGENCY_MONTHLY_PRICE_ID` | Agency monthly Price ID | Same |
| `STRIPE_AGENCY_ANNUAL_PRICE_ID` | Agency annual Price ID | Same |

---

## Email (Resend — welcome & upgrade emails)

| Variable | Description | Get it from |
|----------|-------------|-------------|
| `RESEND_API_KEY` | Resend API key | https://resend.com/api-keys |
| `RESEND_FROM_EMAIL` | From address (e.g. `support@repostai.com`) | Your verified domain in Resend |

---

## Error tracking (Sentry)

| Variable | Description | Get it from |
|----------|-------------|-------------|
| `NEXT_PUBLIC_SENTRY_DSN` | Sentry DSN (client + server) | Sentry.io → Project Settings → Client Keys (DSN) |
| `SENTRY_AUTH_TOKEN` | Auth token (for source maps / releases) | Sentry.io → Settings → Auth Tokens |

---

## Analytics (PostHog)

| Variable | Description | Get it from |
|----------|-------------|-------------|
| `NEXT_PUBLIC_POSTHOG_KEY` | PostHog project API key | PostHog → Project Settings |
| `NEXT_PUBLIC_POSTHOG_HOST` | Optional; default `https://app.posthog.com` | PostHog cloud or your self-hosted URL |

---

## Social posting (OAuth)

| Variable | Description | Get it from |
|----------|-------------|-------------|
| `LINKEDIN_CLIENT_ID` | LinkedIn OAuth app client ID | LinkedIn Developer Portal → your app → Auth |
| `LINKEDIN_CLIENT_SECRET` | LinkedIn OAuth app secret | Same |
| `TWITTER_CLIENT_ID` | Twitter/X OAuth 2.0 Client ID | Twitter Developer Portal → your app |
| `TWITTER_CLIENT_SECRET` | Twitter/X OAuth 2.0 Client Secret | Same |
| `NEXT_PUBLIC_APP_URL` | Must match OAuth redirect URIs | You set this (e.g. `http://localhost:3000` or `https://yourdomain.com`) |

**LinkedIn:** In the [LinkedIn Developer Portal](https://www.linkedin.com/developers/apps), open your app → **Auth** → **OAuth 2.0 settings** → **Authorized redirect URLs**. Add the **exact** redirect URL for each environment you use:
- Local: `http://localhost:3000/api/connect/linkedin/callback`
- Production: `https://your-domain.com/api/connect/linkedin/callback` (no trailing slash)

The redirect URL must match the host the user accesses the app from. If you use multiple URLs (e.g. preview + production), add each to LinkedIn.

---

## Zapier

RepostAI sends repurpose results to Zapier via a **per-user webhook URL**. Users set their URL on the Integrations page (stored in `profiles.zapier_webhook_url`). No app-level env var is required.

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_ZAPIER_APP_URL` | Optional. If set, Integrations page shows an "Open Zapier app" link (e.g. to your custom Zapier app). |

Run the migration in `docs/SUPABASE_FULL_SCHEMA_AND_MIGRATION.sql` to add the `zapier_webhook_url` column to `profiles` if you haven’t already.

---

## Optional / other

| Variable | Description |
|----------|-------------|
| `CRON_SECRET` | If set, protects `/api/cron/scheduled-posts` (Bearer token or `?secret=`) |
| `ENCRYPTION_SECRET` | Min 16 chars; encrypts OAuth tokens in DB (if using encryption) |
| Razorpay keys | See `.env.example` if you use Razorpay for India |

---

## Production checklist (Vercel)

1. Add **SUPABASE_SERVICE_ROLE_KEY** to Vercel env vars.
2. Switch **STRIPE_SECRET_KEY** from `sk_test_` to `sk_live_` when going live.
3. Add **STRIPE_WEBHOOK_SECRET** from Stripe Dashboard (webhook endpoint URL: `https://your-domain.com/api/stripe/webhook`).
4. Add **UPSTASH_REDIS_REST_URL** and **UPSTASH_REDIS_REST_TOKEN**.
5. Add **RESEND_API_KEY** and **RESEND_FROM_EMAIL**.
6. Add **NEXT_PUBLIC_SENTRY_DSN** (and **SENTRY_AUTH_TOKEN** for releases).
7. Add **NEXT_PUBLIC_POSTHOG_KEY**.
8. Set **NEXT_PUBLIC_APP_URL** = your production URL (e.g. `https://your-app.vercel.app`). Required for auth redirects and OAuth (LinkedIn/Twitter).
9. For **Connections** (Connect LinkedIn / Twitter): add **LINKEDIN_CLIENT_ID**, **LINKEDIN_CLIENT_SECRET**, **TWITTER_CLIENT_ID**, **TWITTER_CLIENT_SECRET** in Vercel, and add the matching redirect URLs in the LinkedIn and Twitter app settings (e.g. `https://your-app.vercel.app/api/connect/linkedin/callback`).

If the dashboard shows on local but features like Connections or “Post now” are missing on Vercel, the usual cause is missing or incorrect env vars in Vercel (especially **NEXT_PUBLIC_APP_URL** and Supabase keys). Redeploy after adding them.

**Landing page not showing or looks wrong on Vercel**
- Open the **root** URL: `https://your-deployment.vercel.app/` (not `/dashboard/history`). The landing page is only at `/`.
- Set **NEXT_PUBLIC_APP_URL** in Vercel to that exact root URL (e.g. `https://repostai-xxx.vercel.app`). Required for auth and OAuth redirects; if missing, some assets or redirects can break.
- For **preview** deployments, use the preview URL: e.g. `https://repostai-ib377kgli-anupamudgatas-projects.vercel.app` (no path). Redeploy after changing env vars.

---

## Nothing changes on Vercel? (Troubleshooting)

**Full guide:** [VERCEL_DEPLOYMENT_TROUBLESHOOTING.md](VERCEL_DEPLOYMENT_TROUBLESHOOTING.md) — same old page, login redirect, landing, cron, env.

If the app works locally but on Vercel you still see the old page, wrong redirect after login, or “nothing changes”:

1. **Supabase Redirect URLs**
   - **Supabase** → **Authentication** → **URL Configuration** → **Redirect URLs**.
   - Add **every** URL you use, including the exact Vercel URL (e.g. `https://repostai-xxx-anupamudgatas-projects.vercel.app/**`). Use the **same** URL you see in the browser when you open the app.
   - Optional: set **Site URL** to that same base URL (e.g. `https://repostai-xxx.vercel.app`) so Supabase uses it as the default redirect target.

2. **Which deployment are you opening?**
   - Each deploy has a unique URL like `repostai-<hash>-anupamudgatas-projects.vercel.app`. Open the **latest** deployment: **Vercel** → **Deployments** → click the top one → open its **Visit** URL.
   - Or use the **stable** branch URL: `https://repostai-git-<branch>-anupamudgatas-projects.vercel.app` (e.g. `repostai-git-main-...` or `repostai-git-dev-...`), which always points to the latest deploy for that branch.

3. **Redeploy after env or Supabase changes**
   - Env vars are applied at **build** time. After changing **Environment Variables** in Vercel or **Redirect URLs** in Supabase, trigger a **new deploy** (e.g. **Deployments** → **⋯** → **Redeploy**), then wait for it to finish and open that deployment’s URL.

4. **Cache**
   - Do a hard refresh: **Ctrl+Shift+R** (Windows) or **Cmd+Shift+R** (Mac), or test in an **incognito/private** window.

5. **Auth callback**
   - The app redirects after login to the **same host** that received the callback (no need to set `NEXT_PUBLIC_APP_URL` just for that). If you use Google OAuth, the redirect URL Supabase uses must be exactly `https://<your-vercel-host>/api/auth/callback` and that host must be in **Redirect URLs**.

That’s it. You’re production-ready.
