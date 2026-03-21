# RepostAI - System Architecture

**Version:** 1.0  
**Last Updated:** March 5, 2026

---

## 1. High-Level Architecture

```
┌──────────────────────────────────────────────────────┐
│                    Client (Browser)                    │
│            Next.js App Router + React 19               │
│            Tailwind CSS + shadcn/ui                    │
└──────────────┬───────────────────┬───────────────────┘
               │                   │
               ▼                   ▼
┌──────────────────────┐  ┌────────────────────────────┐
│  Next.js API Routes  │  │   Supabase Auth (OAuth)     │
│  /api/repurpose      │  │   Google + Email/Password   │
│  /api/webhooks       │  └────────────────────────────┘
│  /api/billing        │
│  /api/scrape         │
└──────┬───────────────┘
       │
       ├──────────────────┐──────────────────┐
       ▼                  ▼                  ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│   OpenAI     │  │   Supabase   │  │   Stripe     │
│  GPT-4o-mini │  │  PostgreSQL  │  │   Payments   │
│  (AI Engine) │  │  + RLS       │  │  + Webhooks  │
└──────────────┘  └──────────────┘  └──────────────┘
```

## 2. Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Frontend | Next.js 16 (App Router) | SSR, routing, API routes |
| UI | Tailwind CSS + shadcn/ui | Styling, component library |
| Auth | Supabase Auth | Google OAuth + email/password |
| Database | Supabase PostgreSQL | Data storage with RLS |
| AI | OpenAI GPT-4o-mini | Content generation |
| Payments | Stripe | Subscriptions + billing |
| Hosting | Vercel | Serverless deployment |
| Email | Resend | Transactional emails |
| Error Tracking | Sentry | Error monitoring |
| Analytics | PostHog | User analytics |

## 3. Database Schema

### Tables

#### profiles
| Column | Type | Description |
|--------|------|-------------|
| id | uuid (PK, FK to auth.users) | User ID from Supabase Auth |
| email | text | User email |
| name | text | Display name |
| avatar_url | text | Profile picture URL |
| plan | text | 'free', 'pro', or 'agency' |
| stripe_customer_id | text | Stripe customer ID |
| created_at | timestamptz | Account creation date |

#### subscriptions
| Column | Type | Description |
|--------|------|-------------|
| id | uuid (PK) | Subscription ID |
| user_id | uuid (FK to profiles) | User reference |
| stripe_subscription_id | text | Stripe subscription ID |
| plan | text | 'pro' or 'agency' |
| status | text | 'active', 'canceled', 'past_due' |
| current_period_end | timestamptz | When subscription renews |
| created_at | timestamptz | Creation date |

#### brand_voices
| Column | Type | Description |
|--------|------|-------------|
| id | uuid (PK) | Voice ID |
| user_id | uuid (FK to profiles) | Owner |
| name | text | Voice name |
| sample_text | text | Writing style samples |
| description | text | Optional description |
| created_at | timestamptz | Creation date |

#### repurpose_jobs
| Column | Type | Description |
|--------|------|-------------|
| id | uuid (PK) | Job ID |
| user_id | uuid (FK to profiles) | Owner |
| input_type | text | 'text', 'url', 'youtube', 'pdf' |
| input_content | text | The source content (truncated) |
| input_url | text | Source URL if applicable |
| brand_voice_id | uuid (FK to brand_voices) | Optional voice |
| created_at | timestamptz | Creation date |

#### repurpose_outputs
| Column | Type | Description |
|--------|------|-------------|
| id | uuid (PK) | Output ID |
| job_id | uuid (FK to repurpose_jobs) | Parent job |
| platform | text | Target platform |
| generated_content | text | AI-generated content |
| edited_content | text | User-edited version |
| created_at | timestamptz | Creation date |

#### usage
| Column | Type | Description |
|--------|------|-------------|
| id | uuid (PK) | Record ID |
| user_id | uuid (FK to profiles) | User |
| month | text | 'YYYY-MM' format |
| repurpose_count | integer | Number of repurposes this month |

### Row-Level Security (RLS)

All tables have RLS enabled. Users can only read/write their own data:
- `profiles`: Users can read/update their own profile
- `brand_voices`: Users can CRUD their own voices
- `repurpose_jobs`: Users can read their own jobs, insert new ones
- `repurpose_outputs`: Users can read outputs for their own jobs
- `usage`: Users can read their own usage records

## 4. API Routes

| Route | Method | Description |
|-------|--------|-------------|
| /api/repurpose | POST | Main repurposing endpoint |
| /api/auth/callback | GET | OAuth callback handler |
| /api/webhooks/stripe | POST | Stripe webhook handler |
| /api/billing/portal | POST | Create Stripe billing portal session |
| /api/billing/checkout | POST | Create Stripe checkout session |

## 5. Authentication Flow

1. User clicks "Sign up" or "Sign in with Google"
2. Supabase Auth handles OAuth flow
3. On success, redirects to /api/auth/callback
4. Callback exchanges code for session
5. Middleware checks session on every /dashboard/* request
6. Unauthenticated users are redirected to /login

## 6. Payment Flow

1. User clicks "Upgrade to Pro"
2. Frontend calls /api/billing/checkout with selected plan
3. Server creates Stripe Checkout session
4. User redirected to Stripe-hosted payment page
5. On success, Stripe sends webhook to /api/webhooks/stripe
6. Webhook handler updates profile.plan and creates subscription record
7. User redirected back to /dashboard with success message

## 7. Repurposing Flow

1. User pastes content / URL in dashboard
2. Selects target platforms
3. Clicks "Repurpose"
4. Frontend sends POST to /api/repurpose
5. Server validates input + checks ¯usage limits
6. If URL/YouTube: scrapes/transcribes content
7. Builds prompt with platform instructions + optional brand voice
8. Calls OpenAI GPT-4o-mini with JSON response format
9. Parses response, saves to DB (job + outputs)
10. Returns outputs to frontend
11. User sees results, can copy/regenerate each
