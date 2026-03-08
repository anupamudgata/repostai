# RepostAI – Comparison: PRD vs Built, v2, Extras, vs Competitors

## 1. RepostAI vs PRD (MVP)

### Must-have user stories (MVP / v1.0)

| PRD user story | Status | Notes |
|----------------|--------|--------|
| Paste text content and get posts for all selected platforms in one click | Done | Dashboard + `/api/repurpose` |
| Paste blog URL and system auto-extracts content | Done | URL scraper (SSRF-safe, timeout) |
| Paste YouTube URL and system auto-transcribes video | Done | YouTube transcript extraction |
| Select which platforms to get output for | Done | 7 platforms; free tier limited to 4 |
| Copy any generated output with one click | Done | Copy button per platform (dashboard + history) |
| Regenerate output for a specific platform | Done | Regenerate per platform; `/api/repurpose/regenerate` |
| View repurposing history | Done | `/dashboard/history`, expandable cards, copy |
| Train AI on writing style (brand voice) | Done | Brand voice CRUD, plan limits (0/3/10), used in repurpose |
| Sign up with email or Google | Done | Signup + login, Supabase Auth |
| Upgrade Free to Pro or Agency | Done | Razorpay (India) + Stripe (optional), Settings |
| Manage subscription and billing | Done | Stripe portal or “email support” for Razorpay |

**Result: All MVP user stories from the PRD are implemented.**

### Feature specs (PRD vs built)

| Spec | PRD | Built |
|------|-----|--------|
| **Inputs** | Text, blog URL, YouTube, PDF (v2) | Text, blog URL, YouTube. PDF in UI as “coming soon”, no backend. |
| **Output platforms** | 7 (LinkedIn, Twitter thread, Twitter single, Instagram, Facebook, Email, Reddit) | Same 7; free tier restricted to 4. |
| **Brand voice** | 3 on Pro, 10 on Agency | Same; enforced on brand-voice page and in repurpose flow. |
| **Usage limits** | Free: 5/month, 3 platforms; Pro/Agency: unlimited | Free: 5/month, 4 platforms; Pro/Agency: unlimited, all 7. |

---

## 2. RepostAI vs v2.0 (nice-to-have)

| v2 feature | PRD | Status |
|------------|-----|--------|
| Direct posting / scheduling to platforms | v2 | **Done** – Connections, Post now, Schedule + cron; Twitter/X supported. |
| Image and carousel generation | v2 | Not built. |
| Team collaboration (shared workspaces) | v2 | Not built. |
| Analytics (which repurposed posts performed best) | v2 | Not built. |
| Multi-language output | v2 | **Done** – EN, HI, ES in repurpose and AI Content Starter. |
| PDF upload and text extraction | v2 | Not built; UI “coming soon” only. |
| Chrome extension | v2 | Not built. |

---

## 3. Extras we added (not in original PRD)

| Feature | Status |
|--------|--------|
| **AI Content Starter** | Done – topic → blog draft → edit → repurpose to platforms. |
| **Razorpay for India** | Done – subscriptions + webhooks; Stripe still optional. |
| **Legal pages** | Done – Privacy, Terms. |
| **SEO** | Done – robots.txt, sitemap.xml, OG image. |
| **Forgot password** | Done – reset flow and login success message. |
| **Support email constant** | Done – single `SUPPORT_EMAIL` for footer, settings, legal. |
| **Pre-deploy hardening** | Done – SSRF fix, timing-safe HMAC, JSON parse guard, timeouts, usage race fix, Stripe lazy init, etc. |
| **Mobile nav** | Done – hamburger menu on dashboard. |
| **Free-tier platform gating** | Done – UI and API restrict free users to 4 platforms. |
| **Honest landing copy** | Done – no fake user counts; use cases instead of fake testimonials. |

---

## 4. RepostAI vs Repurpose.io

| Dimension | RepostAI | Repurpose.io |
|-----------|----------|--------------|
| **Core job** | One piece of content → **AI-generated text** for 7 platforms | **Video/audio** → distribute to many platforms |
| **Input** | Text, URL, YouTube (transcript) | Video (TikTok, Reels, Lives, etc.) |
| **Output** | Platform-native **copy** (LinkedIn, Twitter, IG caption, etc.) | Same/resized **video** on many channels |
| **Publish** | Copy only (connect + post/schedule in Phase 2) | Connect accounts + **auto-publish** |
| **Differentiators** | Brand voice, multi-language, AI Content Starter, India pricing (Razorpay) | Multi-account, video workflows, resizing, watermark removal |
| **Pricing** | Free + Pro (~$19/₹1499) + Agency (~$49/₹3499) | ~$35–179/mo |

**Summary:** RepostAI = AI text repurposing (copy today; connect + post/schedule planned). Repurpose.io = video distribution + connected accounts + auto-publish.
