# Environment Variables Guide

This doc lists environment variables used by RepostAI, with a focus on **post, schedule, and cron**. Use it to configure local (`.env.local`) and production (e.g. Vercel).

---

## Step-by-step: How to document and set env vars

### Step 1: List what you need

For **post now** and **scheduled posts** to work in production you need:

| Variable | Used for | Required for post/schedule? |
|----------|----------|-----------------------------|
| `CRON_SECRET` | Securing the cron endpoint that runs scheduled posts | Yes (if you want cron protected) |
| `ENCRYPTION_SECRET` | Encrypting OAuth tokens in DB | Yes |
| `TWITTER_CLIENT_ID` | Twitter/X OAuth (Connect) | Yes for Twitter post |
| `TWITTER_CLIENT_SECRET` | Twitter/X OAuth callback | Yes for Twitter post |
| `NEXT_PUBLIC_APP_URL` | Redirect URIs for OAuth and links | Yes |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project | Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Cron job reads/updates DB | Yes for scheduled posts |

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

# Supabase (you likely have these already)
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
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

### Step 6: (Later) LinkedIn env vars

When LinkedIn OAuth and post are implemented you will add:

- `LINKEDIN_CLIENT_ID`
- `LINKEDIN_CLIENT_SECRET`

Callback will be: `https://your-domain.com/api/connect/linkedin/callback`.

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

## Other env vars (for reference)

The app also uses:

- **Supabase:** `NEXT_PUBLIC_SUPABASE_ANON_KEY` (auth, client).
- **OpenAI:** `OPENAI_API_KEY` (repurpose, AI Content Starter).
- **Billing:** Stripe (`STRIPE_*`), Razorpay (`RAZORPAY_*`) — see billing routes if you enable payments.
- **Landing:** `NEXT_PUBLIC_DEMO_VIDEO_URL`, `NEXT_PUBLIC_ZAPIER_APP_URL` (optional).

For a minimal production deploy focused on **post + schedule**, the table in “Full reference” above is the set you must have.
