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

## 5. Vercel / Hosting

- [ ] **Cron** — Add cron job: `0 * * * *` → `/api/cron/scheduled-posts`
- [ ] **CRON_SECRET** — Set in env; add `Authorization: Bearer {CRON_SECRET}` header in Vercel cron config
- [ ] **Domain** — Point custom domain
- [ ] **Build** — Verify `npm run build` succeeds

---

## 6. Legal & Content

- [ ] Update `SUPPORT_EMAIL` in constants if needed
- [ ] Review `/privacy` and `/terms` pages
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
