# Environment Variables Guide

This doc lists environment variables used by RepostAI, with a focus on **post, schedule, and cron**. Use it to configure local (`.env.local`) and production (e.g. Vercel).

**Also see:** [docs/ENV_VARS_CHECKLIST.md](ENV_VARS_CHECKLIST.md) for the full table (Stripe, Sentry, PostHog, Razorpay, etc.)  
**Supabase CLI migrations:** optional `SUPABASE_DB_PASSWORD` (database password from the dashboard, not the anon key) — see [docs/SUPABASE_MIGRATIONS.md](SUPABASE_MIGRATIONS.md) and `npm run db:push:remote`..

**Check what’s still empty locally (names only, no secrets):**

```bash
node scripts/check-env-keys.mjs
```

---

## Step-by-step: How to document and set env vars

### Step 1: List what you need

**Core app** (login + repurpose):

| Variable | Used for |
|----------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Auth + browser Supabase client |
| `SUPABASE_SERVICE_ROLE_KEY` | Server/admin DB access |
| `OPENAI_API_KEY` | Repurpose, extracts, AI Content Starter |
| `NEXT_PUBLIC_APP_URL` | OAuth redirects, absolute links |

**Post / schedule / cron** (plus Twitter connect):

| Variable | Used for | Required for post/schedule? |
|----------|----------|-----------------------------|
| `CRON_SECRET` | Securing `/api/cron/scheduled-posts` | Yes (if you want cron protected) |
| `ENCRYPTION_SECRET` | Encrypting OAuth tokens in DB | Yes (for Connect / post) |
| `TWITTER_CLIENT_ID` | Twitter/X OAuth (Connect) | Yes for Twitter post |
| `TWITTER_CLIENT_SECRET` | Twitter/X OAuth callback | Yes for Twitter post |
| `NEXT_PUBLIC_APP_URL` | Redirect URIs | Yes |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase | Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Cron reads/writes `scheduled_posts`, etc. | Yes for scheduled posts |

### Step 2: Set locally (development)

1. In the project root, create or edit `.env.local`.
2. Add each variable on its own line: `NAME=value`.
3. Never commit `.env.local` (it should be in `.gitignore`).
4. Restart the dev server after changes.

Example:

```bash
# Post / Schedule / Cron
CRON_SECRET=your-random-secret-at-least-16-chars
ENCRYPTION_SECRET=your-encryption-secret-at-least-16-chars
TWITTER_CLIENT_ID=your-twitter-oauth-client-id
TWITTER_CLIENT_SECRET=your-twitter-oauth-client-secret
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Supabase + OpenAI (core)
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
OPENAI_API_KEY=sk-...
```

### Step 3: Set in production (e.g. Vercel)

1. Open your project on [Vercel](https://vercel.com) → **Settings** → **Environment Variables**.
2. For each variable:
   - **Name:** exact name (e.g. `CRON_SECRET`).
   - **Value:** the secret value (paste once; you can’t read it back).
   - **Environment:** choose Production (and Preview if you want cron on preview).
3. Click **Save**.
4. Redeploy so the new variables are applied (e.g. **Deployments** → latest → **Redeploy**).

### Step 4: Get Twitter OAuth credentials

1. Go to [Twitter Developer Portal](https://developer.twitter.com/) → your project → **App** → **Settings** → **User authentication**.
2. Enable OAuth 2.0, set **Callback URI** to:  
   `https://your-production-domain.com/api/connect/twitter/callback`  
   (for local: `http://localhost:3000/api/connect/twitter/callback`).
3. Copy **Client ID** → `TWITTER_CLIENT_ID`.
4. Copy **Client Secret** → `TWITTER_CLIENT_SECRET`.

### Step 5: Generate secrets

- **CRON_SECRET:** Any long random string (e.g. `openssl rand -hex 32`). Used to protect `/api/cron/scheduled-posts`; if set, requests must send `Authorization: Bearer <CRON_SECRET>` or `?secret=<CRON_SECRET>`.
- **ENCRYPTION_SECRET:** At least 16 characters; used to encrypt OAuth tokens in the DB. Use a different value from CRON_SECRET (e.g. another `openssl rand -hex 32`).

### Cron on Vercel Hobby vs Pro

- **Hobby:** Vercel allows **only one cron invocation per day**. This project’s `vercel.json` uses **`0 9 * * *`** (daily ~09:00 UTC) so deployment succeeds on Hobby. Hourly schedules will **fail**.
- **Pro:** You can use hourly or more frequent crons in `vercel.json`.
- Set **`CRON_SECRET`** in Vercel env; Vercel Cron sends `Authorization: Bearer <CRON_SECRET>`. For extra runs without Pro, use an external cron hitting the same URL with that header. See **`docs/PRE_LAUNCH_CHECKLIST.md` §5**.

### Step 6: LinkedIn env vars (Connect / post)

Add:

- `LINKEDIN_CLIENT_ID`
- `LINKEDIN_CLIENT_SECRET`

Callback (example): `https://your-domain.com/api/connect/linkedin/callback` — must match **LinkedIn Developer Portal → Auth → Redirect URLs** and the URL users actually open.

---

## Full reference: Post / Schedule / Cron

| Variable | Description | Where used |
|----------|-------------|------------|
| `CRON_SECRET` | Optional. If set, `/api/cron/scheduled-posts` requires `Authorization: Bearer <value>` or `?secret=<value>`. | [api/cron/scheduled-posts](src/app/api/cron/scheduled-posts/route.ts) |
| `ENCRYPTION_SECRET` | Min 16 chars. Used to encrypt/decrypt OAuth tokens in `connected_accounts`. | [lib/crypto/tokens.ts](src/lib/crypto/tokens.ts) |
| `TWITTER_CLIENT_ID` | Twitter OAuth 2.0 Client ID. | [api/connect/twitter](src/app/api/connect/twitter/route.ts) |
| `TWITTER_CLIENT_SECRET` | Twitter OAuth 2.0 Client Secret. | [api/connect/twitter/callback](src/app/api/connect/twitter/callback/route.ts) |
| `NEXT_PUBLIC_APP_URL` | App base URL (e.g. `https://repostai.com`). Used for OAuth redirects and links. | [config/constants.ts](src/config/constants.ts), Twitter/LinkedIn routes |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL. | Supabase client + cron |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (cron uses it to read/update `scheduled_posts`, `connected_accounts`). | [api/cron/scheduled-posts](src/app/api/cron/scheduled-posts/route.ts) |

---

## Photo → captions → post (R2 + Meta Instagram)

| Variable | Description |
|----------|-------------|
| `R2_ACCOUNT_ID` | Cloudflare R2 account id |
| `R2_ACCESS_KEY_ID` | R2 S3 API token access key |
| `R2_SECRET_ACCESS_KEY` | R2 S3 API token secret |
| `R2_BUCKET_NAME` | Bucket for `photos/` and `thumbnails/` keys |
| `R2_PUBLIC_URL` | Public base URL for objects (no trailing slash), e.g. `https://pub-xxx.r2.dev` or your custom domain |
| `OPENAI_API_KEY` | Vision analysis on upload (`OPENAI_VISION_MODEL` optional, default `gpt-4o-mini`) |
| `FACEBOOK_APP_ID` / `FACEBOOK_APP_SECRET` | Meta app for Instagram OAuth (`META_APP_ID` / `META_APP_SECRET` aliases supported) |
| Callback | Add to Meta app: `{NEXT_PUBLIC_APP_URL}/api/social/callback/instagram` |

Instagram posting needs a **Facebook Page** linked to an **Instagram Business** account. Connect from **Dashboard → Connections** (Instagram). Scheduled photo posts are picked up by the same `/api/cron/scheduled-posts` job as other schedules (daily on Hobby — see cron section above).

---

## Other env vars (for reference)

The app also uses:

- **Rate limits:** `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`.
- **Billing:** Stripe (`STRIPE_*`), Razorpay (`RAZORPAY_*`) — see billing routes if you enable payments. Razorpay subscription IDs are stored in `subscriptions.stripe_subscription_id` (legacy column name; value is the Razorpay subscription id). Thin aliases: `POST /api/checkout/create` → Razorpay create subscription, `GET /api/checkout/verify` → payment callback (same as `/api/billing/razorpay/callback`).
- **Landing:** `NEXT_PUBLIC_DEMO_VIDEO_URL`, `NEXT_PUBLIC_ZAPIER_APP_URL` (optional).
- **GDPR account deletion (email link):** `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, `NEXT_PUBLIC_APP_URL` (link in email). Optional `ACCOUNT_DELETION_TOKEN_SECRET` (min 16 chars); if unset, signing falls back to `CRON_SECRET` then `ENCRYPTION_SECRET`. Endpoints: `POST /api/user/delete/request` (signed-in), `POST /api/user/delete/complete` (token + phrase), `DELETE /api/user/delete` (signed-in + phrase).
- **Brand voice (Claude 3.5 Haiku):** `ANTHROPIC_API_KEY` — used to generate the cached persona from writing samples. Optional `ANTHROPIC_BRAND_VOICE_MODEL` (default `claude-3-5-haiku-20241022`). If `ANTHROPIC_API_KEY` is unset, persona generation falls back to OpenAI `gpt-4o-mini`. Run migration `20250320140000_brand_voices_persona_model.sql` so `persona_model` is stored in Supabase.
- **Repurpose (Pro/Agency — Claude with GPT‑4o‑mini fallback):** same `ANTHROPIC_API_KEY`. Optional `ANTHROPIC_REPURPOSE_MODEL` (default `claude-sonnet-4-20250514`). Free tier uses GPT‑4o‑mini only.

For a minimal production deploy focused on **post + schedule**, the table in “Full reference” above is the set you must have.
