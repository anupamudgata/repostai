# RepostAI — Pre-Launch Checklist

Complete these before going live.

---

## 1. Database (Supabase)

- [ ] **Apply schema** — Run in Supabase SQL Editor (in order):
  1. `docs/DATABASE_SCHEMA.sql`
  2. `SCHEMA_FIXES.sql`
  3. `supabase/migrations/*.sql` (any not already in base schema)
- [ ] **Verify** — Visit `/api/db-check` — should return `ok: true`
- [ ] **Auth** — Enable Email signup in Supabase → Authentication → Providers
- [ ] **Redirect URLs** — Add production URL to Supabase Auth redirect allowlist

---

## 2. Environment Variables (Production)

Set in Vercel (or your host) → Project → Settings → Environment Variables:

| Variable | Required | Notes |
|----------|----------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ | Supabase service role |
| `OPENAI_API_KEY` | ✅ | OpenAI API key |
| `NEXT_PUBLIC_APP_URL` | ✅ | e.g. `https://repostai.com` |
| `RAZORPAY_KEY_ID` | If payments | Razorpay key |
| `RAZORPAY_KEY_SECRET` | If payments | Razorpay secret |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | If payments | Same as key ID |
| `RAZORPAY_WEBHOOK_SECRET` | If payments | From Razorpay webhooks |
| `RAZORPAY_PLAN_PRO_MONTHLY` | If payments | Plan ID from Razorpay |
| `LINKEDIN_CLIENT_ID` | If LinkedIn | OAuth app |
| `LINKEDIN_CLIENT_SECRET` | If LinkedIn | OAuth app |
| `TWITTER_CLIENT_ID` | If Twitter | OAuth app |
| `TWITTER_CLIENT_SECRET` | If Twitter | OAuth app |
| `CRON_SECRET` | For cron | Random string for cron auth |
| `RESEND_API_KEY` | If emails | For transactional email |
| `UPSTASH_REDIS_REST_URL` | If rate limit | Upstash Redis |
| `UPSTASH_REDIS_REST_TOKEN` | If rate limit | Upstash Redis |
| `NEXT_PUBLIC_SENTRY_DSN` | Optional | Error tracking |
| `NEXT_PUBLIC_POSTHOG_KEY` | Optional | Analytics |

---

## 3. Razorpay (Payments)

- [ ] Create Razorpay account (live mode for production)
- [ ] Create Plans: Pro Monthly, Pro Annual, Agency Monthly, Agency Annual
- [ ] Add webhook: `https://your-domain.com/api/webhooks/razorpay`
- [ ] Set webhook secret in env
- [ ] Test upgrade flow end-to-end

---

## 4. Social OAuth (One-Click Post)

**LinkedIn:**
- [ ] Create app at [LinkedIn Developers](https://www.linkedin.com/developers/apps)
- [ ] Add redirect: `{NEXT_PUBLIC_APP_URL}/api/connect/linkedin/callback`
- [ ] Request `w_member_social` scope (post on behalf)
- [ ] Add env vars

**Twitter/X:**
- [ ] Create app at [Twitter Developer Portal](https://developer.twitter.com)
- [ ] Add callback: `{NEXT_PUBLIC_APP_URL}/api/connect/twitter/callback`
- [ ] Enable OAuth 2.0, request `tweet.write` scope
- [ ] Add env vars

---

## 5. Vercel / Hosting & scheduled posts (cron)

### Hobby (free) vs Pro

| Plan | Vercel Cron limit |
|------|-------------------|
| **Hobby** | **At most once per day.** Expressions like `0 * * * *` (hourly) **will fail deployment**. |
| **Pro** | Hourly and more frequent schedules are allowed. |

This repo’s `vercel.json` uses **`0 9 * * *`** — **once per day at 09:00 UTC** — so it **deploys on Hobby**. Vercel may run it anytime within that hour (not exact to the minute).

**Trade-off on Hobby:** Posts are only picked up when the daily cron runs. If you need **hourly** checks, either **upgrade to Vercel Pro** and change the schedule back to hourly, or use an **external cron** (e.g. cron-job.org) to `GET` your endpoint more often (see below).

### Configure cron + `CRON_SECRET`

1. **Repo already defines cron** in `vercel.json` → `/api/cron/scheduled-posts` at `0 9 * * *` (adjust the hour in that file if you want a different UTC window).
2. In Vercel → **Settings** → **Environment Variables**:
   - Add **`CRON_SECRET`** = long random string (e.g. `openssl rand -hex 32`).
   - Redeploy after saving.
3. Vercel Cron will send **`Authorization: Bearer <CRON_SECRET>`** automatically when `CRON_SECRET` is set in the project — no manual header config in the dashboard is required for the built-in cron.
4. **Always set `CRON_SECRET` in production** so random callers cannot trigger the cron URL.

### Manual / external trigger (optional)

Same endpoint, same auth:

```bash
curl -sS -H "Authorization: Bearer YOUR_CRON_SECRET" \
  "https://your-domain.com/api/cron/scheduled-posts"
```

Or with query param (if your route supports it — this app uses **Bearer** in `Authorization`):

```text
GET https://your-domain.com/api/cron/scheduled-posts
Header: Authorization: Bearer YOUR_CRON_SECRET
```

Use an external scheduler (cron-job.org, GitHub Actions, etc.) for **more than once per day** while staying on **Hobby**.

### Vercel CLI (`The specified token is not valid`)

If `vercel --prod` fails with that error, the CLI is usually picking up a **bad or expired `VERCEL_TOKEN`** from your shell (or you never logged in).

1. One-time login (browser): `npm run vercel:login` (or `vercel login`).
2. Deploy without the bad env var: `npm run deploy:vercel` (script unsets `VERCEL_TOKEN` so the CLI uses your saved login under `~/.vercel`).
3. If you still need a token (CI only), create a new one at [Vercel → Account → Tokens](https://vercel.com/account/tokens) — revoke old tokens after rotation.

Do **not** keep an old token in `~/.zshrc` as `export VERCEL_TOKEN=...` unless you maintain it; prefer `vercel login` locally.

### Rest of hosting

- [ ] **Domain** — Point custom domain in Vercel
- [ ] **Build** — Verify `npm run build` succeeds (CI / Vercel)

---

## 6. Legal & Content

- [ ] Update `SUPPORT_EMAIL` in constants if needed
- [ ] Review `/privacy` and `/terms` pages
- [ ] **GDPR deletion** — Set `RESEND_API_KEY` / `RESEND_FROM_EMAIL`, optional `ACCOUNT_DELETION_TOKEN_SECRET` (or rely on `CRON_SECRET` / `ENCRYPTION_SECRET`). Manually test: email link flow (`POST /api/user/delete/request` → confirm page) and “delete now” on `/dashboard/settings/delete`; in Supabase confirm no orphaned rows for `user_id`.
- [ ] Add real testimonials (replace placeholder if any)
- [ ] Set `LANDING_USER_COUNT` if you have a number

---

## 7. Quick Wins (Optional Before Launch)

| Item | Effort | Impact |
|------|--------|--------|
| Remove "Coming soon" from LinkedIn connection (if you have it working) | Low | High |
| Add demo video URL to `LANDING_VIDEO_URL` | Low | Medium |
| Test full flow: signup → repurpose → schedule → cron posts | Medium | Critical |

---

## 8. Launch Day

1. Deploy to production
2. Run `curl https://your-domain.com/api/db-check` — expect `ok: true`
3. Create test account, run repurpose, connect LinkedIn/Twitter, schedule a post
4. Wait for cron (or trigger manually) — verify post publishes
5. Test upgrade flow if Razorpay enabled

---

## Skip for v1 (Post-Launch)

- Approval workflows (Lately-style)
- Team / multi-user
- Instagram, Facebook direct post
- Zapier integration (unless `ZAPIER_APP_URL` set)
