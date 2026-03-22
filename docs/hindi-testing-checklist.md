# Hindi / Hinglish content — QA checklist

Use this for manual review with native speakers (and for your own spot checks). Targets the **repurpose** (batch + stream) and **photo captions** flows when output language is **हिन्दी**.

## Quick product checks

1. Dashboard → choose **हिन्दी** as output language → run repurpose on a short English or Hinglish source.
2. Compare to **English** on the same source: structure should still match each platform; **voice** should feel Indian-social, not textbook Hindi.

## Per sample, score 1–10

| Criterion | What to look for |
|-----------|------------------|
| **Naturalness** | Sounds like a real creator; Hinglish mix in most sentences; not “Google Translate”. |
| **Script mix** | Devanagari for common Hindi; Latin for startup/content/marketing/AI/platform names. |
| **Platform tone** | LinkedIn: आप, professional warmth. Instagram: casual, emojis OK. X: tight. Reddit: no shilling. |
| **Engagement** | Hook, CTA or question, sensible hashtags (where the format uses them). |

**Target:** average ≥ 8 across reviewers for production confidence.

## Red flags (fail or rewrite)

- Pure Shuddh Hindi nobody would post on IG/LinkedIn.
- Pure English when Hindi mode is selected.
- Wrong register (तुम on LinkedIn corporate post, or आप on meme-y IG caption).
- Literal calques: translating “tool”, “launch”, “content” into heavy Sanskritized words.

## A/B idea (no infra required)

- Keep a copy of an old output (before prompt upgrade) and regenerate with the same input; blind-rank with 2–3 reviewers.

## Notes

- **Batch repurpose** (`/api/repurpose`) injects the full Hindi master block + per-platform rules from `src/lib/prompts/hindi.ts`.
- **Stream repurpose** uses a **compact** Hindi block per platform to limit token use.
- Automated `npm test` suite is not required for prompt strings; validate with real generations and native feedback.
