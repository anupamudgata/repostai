# Changelog

All notable changes to RepostAI will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

---

## [0.1.0] - 2026-03-05

### Added
- Initial project setup with Next.js 16, TypeScript, Tailwind CSS, shadcn/ui
- Project folder structure following company-standard practices
- Supabase client/server/middleware setup for authentication
- OpenAI integration with GPT-4o-mini for content repurposing
- Platform-specific prompt engineering for 7 platforms
- URL scraper for blog content extraction (Cheerio-based)
- YouTube transcript extractor
- Zod validation schemas for API input
- Stripe payment integration (client, helpers, webhook handler)
- Landing page with hero, features, pricing, CTA sections
- Login and signup pages with Google OAuth + email/password
- Dashboard layout with navigation
- Main repurposing interface (text/URL/YouTube input, platform selection, output display)
- Content history page
- Brand voice training page (create, view, delete voices)
- Settings page with billing management
- Auth middleware for protected routes
- Complete database schema with RLS policies (SQL file)
- Product Requirements Document (PRD)
- Architecture documentation
- Environment variable template (.env.example)
- TypeScript type definitions for all entities
- App configuration and constants
