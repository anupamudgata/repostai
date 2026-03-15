# RepostAI — New Code Drop

This folder contains ALL new code written in the build session.
51 production-ready files. Copy each file to the correct path in your project.

## How to install

### Step 1 — Install new packages
```bash
npm install @upstash/ratelimit @upstash/redis @sentry/nextjs posthog-js posthog-node resend stripe @supabase/supabase-js openai
```

### Step 2 — Run database migrations
Open Supabase → SQL Editor → paste the entire contents of MIGRATIONS.sql → Run

### Step 3 — Copy files to your project
Use the file structure below. Every file listed maps directly to where it goes in your Next.js project.

### Step 4 — Add environment variables
See **docs/ENV_VARS_CHECKLIST.md** for every variable needed (local and Vercel).

### Step 5 — Commit
```bash
git add -A
git commit -m "feat: complete production system — rate limiting, RLS, Stripe, emails, Sentry, PostHog, social posting, multi-agent AI, brand voice cache, streaming"
git push origin dev
```

---

## File Map (where each file goes)

### Root of project
- sentry.client.config.ts
- sentry.server.config.ts
- sentry.edge.config.ts

### src/lib/
- ratelimit.ts
- supabase/admin.ts
- stripe/config.ts
- stripe/subscription-helpers.ts
- email/resend.ts
- email/send.ts
- email/templates/welcome.ts
- email/templates/pro-upgrade.ts
- sentry/index.ts
- analytics/posthog.client.ts
- analytics/posthog.server.ts
- analytics/events.ts
- analytics/track.ts
- social/types.ts
- social/token-store.ts
- social/post.ts
- social/posters/linkedin.ts
- social/posters/twitter.ts
- social/posters/facebook.ts
- social/posters/reddit.ts
- ai/types.ts
- ai/repurpose.ts
- ai/brand-voice-cache.ts
- ai/prompts/extractor.ts
- ai/prompts/brand-voice.ts
- ai/prompts/platforms.ts
- ai/prompts/quality-checker.ts

### src/app/api/
- repurpose/stream/route.ts
- stripe/webhook/route.ts
- stripe/portal/route.ts
- social/post/route.ts
- social/accounts/route.ts
- social/connect/linkedin/route.ts
- social/callback/linkedin/route.ts
- brand-voice/route.ts
- user/delete/route.ts

### src/app/
- global-error.tsx
- dashboard/repurpose/page.tsx

### src/hooks/
- useRepurposeStream.ts

### src/providers/
- PostHogProvider.tsx

### src/components/dashboard/
- RepurposeOutput.tsx
- (ConnectedAccounts.tsx, DeleteAccountDialog.tsx, BillingSection.tsx, BrandVoiceManager.tsx — see downloadable files from earlier in the chat)

---

## Key things to configure after copying files

1. Add SUPABASE_SERVICE_ROLE_KEY to Vercel env vars
2. Switch STRIPE_SECRET_KEY from sk_test_ to sk_live_
3. Add STRIPE_WEBHOOK_SECRET from Stripe dashboard
4. Add UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN
5. Add RESEND_API_KEY and RESEND_FROM_EMAIL
6. Add NEXT_PUBLIC_SENTRY_DSN and SENTRY_AUTH_TOKEN
7. Add NEXT_PUBLIC_POSTHOG_KEY
8. Set NEXT_PUBLIC_APP_URL=https://repostai.com

That's it. You're production-ready.
