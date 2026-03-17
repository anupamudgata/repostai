# RepostAI — Project Status & Next Steps

**Last reviewed:** March 2026

---

## 1. Where You Are vs Design Document (PRD)

### MVP (v1.0) — ✅ Complete

| PRD Requirement | Status | Implementation |
|-----------------|--------|----------------|
| Paste text → posts for all platforms | ✅ | Dashboard + `/api/repurpose` |
| Blog URL auto-extract | ✅ | Cheerio scraper (SSRF-safe) |
| YouTube URL auto-transcribe | ✅ | Transcript extraction |
| Select platforms | ✅ | 7 platforms; free tier = 4 |
| Copy output one-click | ✅ | Per platform (dashboard + history) |
| Regenerate per platform | ✅ | `/api/repurpose/regenerate` |
| View history | ✅ | `/dashboard/history` |
| Brand voice training | ✅ | 0/3/10 voices by plan |
| Sign up (email + Google) | ✅ | Supabase Auth |
| Upgrade Free → Pro/Agency | ✅ | Stripe + Razorpay |
| Manage subscription | ✅ | Stripe portal, Settings |

### Input Types

| Input | PRD | Status |
|-------|-----|--------|
| Text | v1 | ✅ |
| Blog URL | v1 | ✅ |
| YouTube | v1 | ✅ |
| **PDF** | v2 | ✅ **Done** — `/api/pdf/extract`, unpdf |

### Output Platforms (7)

LinkedIn, Twitter Thread, Twitter Single, Instagram, Facebook, Email, Reddit — all implemented.

### v2 Nice-to-Have — Partial

| Feature | Status |
|---------|--------|
| Direct posting to platforms | ✅ LinkedIn + Twitter |
| Scheduling + cron | ✅ |
| Multi-language (EN, HI, ES, PT, FR) | ✅ |
| PDF upload | ✅ |
| Image/carousel generation | ❌ Not built |
| Team collaboration | ❌ Not built |
| Analytics | ❌ Not built |
| Chrome extension | ❌ Not built |

---

## 2. Extras Built (Beyond PRD)

- **AI Content Starter** — Topic → blog → repurpose → Post all at one click
- **Zapier webhook** — Per-user webhook URL, notify on repurpose
- **Razorpay** — India payments
- **Legal pages** — Privacy, Terms
- **SEO** — robots.txt, sitemap, OG
- **Forgot password** — Reset flow
- **Mobile nav** — Hamburger on dashboard
- **Superuser bypass** — `SUPERUSER_EMAIL` for testing

---

## 3. Issues Found & Fixed (This Review)

| Issue | Severity | Fix |
|-------|----------|-----|
| History date hydration mismatch | Medium | Use `slice(0,10)` instead of `toLocaleDateString()` |
| Middleware deprecation warning | Low | Next.js 16 "proxy" convention — defer until Next.js migration |

**Build:** ✅ Passes  
**Linter:** ✅ No errors

---

## 4. Known Limitations

1. **Streaming repurpose** (`/api/repurpose/stream`) — Does not save to DB; results don’t appear in History.
2. **History delete** — No delete button; users cannot remove history items.
3. **Edited content** — Post/Schedule use `edited_content` if set, but there’s no UI to edit outputs before posting (only regenerate).
4. **LinkedIn `w_member_social`** — Requires LinkedIn product approval; may fail for new apps.

---

## 5. Next Steps (Prioritized)

### High priority

1. **Delete history** — Add delete button per HistoryCard + `DELETE /api/history/[jobId]` (delete job + outputs).
2. **Commit & push** — Commit all uncommitted changes to `dev` and push to GitHub.

### Medium priority

3. **Streaming → History** — Optionally save stream results to `repurpose_jobs`/`repurpose_outputs` when stream completes.
4. **Edit before post** — Allow editing output in History (or dashboard) before Post/Schedule; persist to `edited_content`.

### Low priority

5. **Middleware migration** — Migrate to Next.js “proxy” when stable.
6. **Image/carousel** — If PRD v2 scope expands.

---

## 6. File Structure (Key Paths)

```
src/
├── app/
│   ├── api/           # API routes (repurpose, post, schedule, connect, etc.)
│   ├── dashboard/     # Dashboard, history, create, connections, settings
│   └── (auth)/        # login, signup, forgot-password
├── components/        # UI + dashboard components
├── lib/               # AI, social, stripe, scrapers, etc.
└── config/            # constants
docs/                  # PRD, schema, env checklist, troubleshooting
```

---

## 7. Env Checklist (Production)

See `docs/ENV_VARS_CHECKLIST.md`. Key vars:

- Supabase (URL, anon key, service role)
- OpenAI API key
- Stripe / Razorpay (billing)
- LinkedIn / Twitter OAuth (connections)
- `NEXT_PUBLIC_APP_URL` (must match OAuth redirect URLs)
