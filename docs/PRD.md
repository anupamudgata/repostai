# RepostAI - Product Requirements Document (PRD)

**Version:** 1.0  
**Date:** March 5, 2026  
**Author:** Solo Founder  
**Status:** In Development

---

## 1. Problem Statement

Content creators, marketers, and small businesses create one piece of content (a blog post, video, or article) but need to distribute it across 5-7 platforms (LinkedIn, Twitter/X, Instagram, Email, Facebook, Reddit). Manually reformatting content for each platform takes 3-5 hours per week and most people either skip platforms or produce low-quality copy-paste posts that perform poorly.

Existing tools are either too expensive ($35-$149/month), focus only on distribution (not creation), or produce generic AI content that sounds robotic.

## 2. Solution

RepostAI is an AI-powered content repurposing tool that takes one piece of content (text, blog URL, YouTube video, or PDF) and generates platform-native posts for 7+ social platforms simultaneously, in under 60 seconds.

## 3. Target Users

| Persona | Description | Willingness to Pay |
|---------|------------|-------------------|
| Content Creators | YouTubers, bloggers, podcasters who create long-form content | $19-$49/month |
| Social Media Managers | Freelancers managing 3-10 client accounts | $49/month (Agency) |
| Small Business Owners | Need social media presence but lack time/skills | $19/month |
| Marketing Teams (1-3 people) | Small startup marketing teams | $49/month |

## 4. User Stories

### Must-Have (MVP / v1.0)
- As a user, I can paste text content and get posts for all selected platforms in one click
- As a user, I can paste a blog URL and the system auto-extracts the content
- As a user, I can paste a YouTube URL and the system auto-transcribes the video
- As a user, I can select which platforms I want output for
- As a user, I can copy any generated output with one click
- As a user, I can regenerate output for a specific platform if I don't like it
- As a user, I can view my repurposing history
- As a user, I can train the AI on my writing style (brand voice)
- As a user, I can sign up with email or Google
- As a user, I can upgrade from Free to Pro or Agency plan
- As a user, I can manage my subscription and billing

### Nice-to-Have (v2.0)
- Direct posting/scheduling to platforms via their APIs
- Image and carousel generation
- Team collaboration (shared workspaces)
- Analytics (track which repurposed posts performed best)
- Multi-language output expansion beyond the core 5 languages (EN, HI, ES, PT, FR)
- PDF upload and text extraction
- Chrome extension for one-click repurposing

## 5. Feature Specifications

### 5a. Content Input
- **Text paste:** Direct text input, max 50,000 characters
- **Blog URL:** Auto-scrape article content using Cheerio
- **YouTube URL:** Auto-extract transcript from captions
- **PDF upload:** (v2 - deferred) Extract text from uploaded PDF

### 5b. Output Platforms
1. **LinkedIn** - Long-form post with hooks, hashtags, CTA
2. **Twitter/X Thread** - 4-7 tweet thread with numbering
3. **Twitter/X Single** - Single tweet under 280 characters
4. **Instagram Caption** - With hashtags and line breaks
5. **Facebook Post** - Conversational tone with CTA
6. **Email Newsletter** - Subject line + intro paragraph
7. **Reddit Post** - Non-promotional tone with discussion prompt

### 5c. Brand Voice Training
- Users paste 3-5 examples of their writing
- AI uses these samples as few-shot examples in the prompt
- Up to 3 voices on Pro, 10 on Agency

### 5d. Usage Limits
- Free: 5 repurposes/month, 3 platforms
- Pro: Unlimited repurposes, all platforms
- Agency: Unlimited + 10 brand voices + API access

## 6. Success Metrics

| Metric | Target (Month 3) | Target (Month 12) |
|--------|------------------|-------------------|
| Total signups | 500 | 8,000 |
| Paid users | 80 | 1,000 |
| MRR | $1,500 | $19,000 |
| Free-to-paid conversion | 6% | 8% |
| Monthly churn | <5% | <3% |
| Average repurposes per paid user | 30/month | 50/month |

## 7. Non-Goals (Explicitly NOT building)

- Not a social media scheduling tool (use Buffer/Hootsuite for that)
- Not a content creation tool (we repurpose, not create from scratch)
- Not an analytics dashboard for social media
- Not a team collaboration platform (initially)

## 8. Technical Constraints

- All AI processing must complete in under 60 seconds
- API costs must stay under $0.10 per user per month
- Must work on mobile browsers (responsive design)
- Must comply with GDPR, CCPA/CPRA, and LGPD for global launch
