# RepostAI

> Paste one piece of content. Get 10+ ready-to-post versions for every platform. Under 60 seconds.

AI-powered content repurposing tool that transforms your blog posts, YouTube videos, or any text into platform-native content for LinkedIn, Twitter/X, Instagram, Email, Facebook, Reddit and more.

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS + shadcn/ui
- **Database:** Supabase (PostgreSQL)
- **Auth:** Supabase Auth (Google OAuth + Email/Password)
- **AI:** OpenAI GPT-4o-mini
- **Payments:** Stripe Subscriptions
- **Hosting:** Vercel
- **Email:** Resend

## Getting Started

### Prerequisites

- Node.js 20+
- npm 10+
- Supabase account (free)
- OpenAI API key
- Stripe account (free)

### Setup

1. **Clone the repo:**
   ```bash
   git clone <your-repo-url>
   cd repostai
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   ```bash
   cp .env.example .env.local
   ```
   Fill in your API keys in `.env.local`. See `.env.example` for descriptions. For **post now** and **scheduled posts** (Twitter OAuth, cron, encryption), see [docs/ENV.md](docs/ENV.md).

4. **Set up Supabase database:**
   - Create a new Supabase project
   - Go to SQL Editor
   - Run the contents of `docs/DATABASE_SCHEMA.sql`

5. **Run the dev server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
src/
├── app/                  # Next.js App Router pages
│   ├── (marketing)/      # Public pages (landing, pricing)
│   ├── (auth)/           # Login, signup
│   ├── dashboard/        # Authenticated app pages
│   └── api/              # API routes
├── components/
│   ├── ui/               # shadcn/ui components
│   ├── marketing/        # Landing page components
│   └── dashboard/        # Dashboard components
├── lib/
│   ├── ai/               # OpenAI integration + prompts
│   ├── supabase/         # DB client, server client, middleware
│   ├── stripe/           # Payment logic + webhook handlers
│   ├── scrapers/         # URL + YouTube content extraction
│   └── validators/       # Zod schemas
├── types/                # TypeScript type definitions
└── config/               # App config, constants
docs/
├── PRD.md                # Product Requirements Document
├── ARCHITECTURE.md       # System architecture
├── DATABASE_SCHEMA.sql   # Supabase SQL schema
├── CHANGELOG.md          # Version history
└── DAILY_LOG.md          # Daily build progress
```

## Development

```bash
npm run dev       # Start dev server
npm run build     # Production build
npm run lint      # Run ESLint
```

## License

Proprietary - All rights reserved.
