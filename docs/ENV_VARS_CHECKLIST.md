# RepostAI — Environment Variables Checklist

Use this list to configure **local** (`.env.local`) and **production** (e.g. Vercel). Copy `.env.example` to `.env.local` and fill in values.

---

## Required for core app

| Variable | Description | Get it from |
|----------|-------------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | Supabase Dashboard → Project Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key | Same as above |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key (server-only) | Same as above |
| `OPENAI_API_KEY` | OpenAI API key | https://platform.openai.com/api-keys |
| `NEXT_PUBLIC_APP_URL` | App URL (e.g. `https://repostai.com` or `http://localhost:3000`) | You set this |

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
| `LINKEDIN_CLIENT_ID` | LinkedIn OAuth app client ID | LinkedIn Developer Portal |
| `LINKEDIN_CLIENT_SECRET` | LinkedIn OAuth app secret | Same |
| `TWITTER_CLIENT_ID` | Twitter/X OAuth 2.0 Client ID | Twitter Developer Portal → your app |
| `TWITTER_CLIENT_SECRET` | Twitter/X OAuth 2.0 Client Secret | Same |
| `NEXT_PUBLIC_APP_URL` | Must match OAuth redirect URIs | You set this |

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
8. Set **NEXT_PUBLIC_APP_URL** = `https://repostai.com` (or your production URL).

That’s it. You’re production-ready.
