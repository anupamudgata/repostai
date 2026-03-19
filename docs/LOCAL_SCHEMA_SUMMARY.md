# RepostAI — Local Database Schema Summary

Based on your migrations + app code. Your app uses **Supabase** (cloud or local).

---

## Tables Your App Expects

| Table | Purpose |
|-------|---------|
| `profiles` | User accounts (plan, email, market_region) — linked to `auth.users` |
| `subscriptions` | Razorpay/Stripe subscription state |
| `brand_voices` | AI brand voice samples + persona |
| `repurpose_jobs` | Repurpose input + status + outputs (jsonb) |
| `repurpose_outputs` | Per-platform generated content |
| `usage` | Monthly repurpose counts |
| `created_posts` | AI Content Starter outputs |
| `connected_accounts` | OAuth tokens (LinkedIn, Twitter) |
| `scheduled_posts` | Posts to publish at a time |
| `post_engagement` | Analytics (likes, comments, impressions) |

---

## Schema Details (from migrations + code)

### profiles
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK, refs auth.users |
| email | text | |
| name | text | |
| avatar_url | text | |
| plan | text | 'free' \| 'pro' \| 'agency' |
| stripe_customer_id | text | Used for Razorpay too |
| market_region | text | na, eu, in, latam, other |
| created_at | timestamptz | |

### subscriptions
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| user_id | uuid | FK → profiles |
| stripe_customer_id | text | |
| stripe_subscription_id | text | UNIQUE, Razorpay sub id |
| stripe_price_id | text | |
| plan | text | 'pro' \| 'agency' |
| status | text | active, canceled, past_due, trialing |
| current_period_start | timestamptz | |
| current_period_end | timestamptz | |
| cancel_at_period_end | boolean | |
| created_at, updated_at | timestamptz | |

### brand_voices
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| user_id | uuid | FK → profiles |
| name | text | |
| samples | text | (was sample_text) |
| description | text | |
| persona | text | |
| persona_generated_at | timestamptz | |
| samples_hash | text | |
| humanization_level | text | casual, professional, raw |
| imperfection_mode | boolean | |
| personal_story_injection | boolean | |
| created_at, updated_at | timestamptz | |

### repurpose_jobs
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| user_id | uuid | FK → profiles |
| input_type | text | text, url, youtube, pdf |
| input_content | text | |
| input_url | text | |
| brand_voice_id | uuid | FK → brand_voices |
| output_language | text | en, hi, es, pt, fr |
| outputs | jsonb | [{ platform, content, type }] |
| status | text | pending, completed, failed |
| created_at | timestamptz | |

### repurpose_outputs
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| job_id | uuid | FK → repurpose_jobs |
| platform | text | |
| generated_content | text | |
| edited_content | text | |
| created_at | timestamptz | |

### connected_accounts
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| user_id | uuid | FK → profiles |
| platform | text | linkedin, twitter |
| platform_user_id | text | |
| platform_username | text | |
| platform_avatar | text | |
| access_token | text | |
| refresh_token | text | |
| token_expires_at | timestamptz | |
| scope, meta | text, jsonb | |
| created_at, updated_at | timestamptz | |
| UNIQUE(user_id, platform) | | |

### scheduled_posts
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| user_id | uuid | FK → profiles |
| connected_account_id | uuid | FK → connected_accounts |
| output_id | uuid | FK → repurpose_outputs |
| platform | text | |
| scheduled_at | timestamptz | |
| status | text | pending, completed, failed |
| posted_at | timestamptz | |
| error_message | text | |
| content_segments | jsonb | (cron uses this) |
| platforms | text[] | (cron uses this) |
| created_at | timestamptz | |

**Note:** Your schedule API inserts one row per platform with `output_id` + `platform`. The cron expects `platforms[]` and `content_segments{}` or `content`. Either:
- Add `content` column and populate from `repurpose_outputs.generated_content` when scheduling, or
- Update cron to fetch content from `repurpose_outputs` via `output_id` when `content_segments` is empty.

### post_engagement
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| user_id | uuid | FK → profiles |
| scheduled_post_id | uuid | FK → scheduled_posts |
| platform | text | |
| content_preview | text | |
| posted_at | timestamptz | |
| likes, comments, shares, impressions, clicks | integer | |
| created_at, updated_at | timestamptz | |

### usage
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| user_id | uuid | FK → profiles |
| month | text | YYYY-MM |
| repurpose_count | integer | |
| UNIQUE(user_id, month) | | |

### created_posts
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| user_id | uuid | FK → profiles |
| topic, tone, length, audience | text | |
| output_language | text | |
| generated_content | text | |
| brand_voice_id | uuid | FK → brand_voices |
| created_at | timestamptz | |

---

## Migration Order (if starting fresh)

1. Base schema: `docs/DATABASE_SCHEMA.sql` (profiles, subscriptions, brand_voices, repurpose_jobs, repurpose_outputs, usage, created_posts, connected_accounts, scheduled_posts)
2. `supabase/migrations/20250312_repurpose_outputs_rls.sql` — INSERT/UPDATE on repurpose_outputs
3. `supabase/migrations/20250317_add_brand_voices_samples.sql` — samples, persona
4. `supabase/migrations/20250318_brand_voice_authenticity_tuning.sql` — humanization_level, etc.
5. `supabase/migrations/20250318120001_repurpose_jobs_outputs_status.sql` — outputs, status on repurpose_jobs
6. `supabase/migrations/20250317120002_post_engagement.sql` — post_engagement table
7. `supabase/migrations/20250319120000_performance_indexes.sql` — indexes

---

## Inconsistencies

| Issue | Location | Fix |
|-------|----------|-----|
| `MIGRATIONS.sql` uses `users`, `repurpose_history`, `usage_tracking` | MIGRATIONS.sql | App uses `profiles`, `repurpose_jobs`, `usage` — don't run old MIGRATIONS.sql |
| `api/razorpay/callback` uses `users` table | src/app/api/razorpay/callback/route.ts | App uses `profiles`; billing flow uses `api/billing/razorpay/callback` |
| `scheduled_posts` may lack `content_segments`, `platforms` | cron route | Add columns if cron fails |

---

## How to Inspect Your Live DB

In Supabase SQL Editor:

```sql
-- List tables
SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;

-- Check columns for a table
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'profiles'
ORDER BY ordinal_position;
```
