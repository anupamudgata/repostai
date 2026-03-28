export const APP_NAME = "RepostAI";
export const APP_DESCRIPTION =
  "Paste one piece of content. Get 10+ ready-to-post versions for every platform. Under 60 seconds.";
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

/** Support / contact email used in footer, settings, and legal pages. */
export const SUPPORT_EMAIL = "support@repostai.com";

/** Superuser email: bypasses free limits, gets Pro plan everywhere (repurpose, stream, create, nav). */
export const SUPERUSER_EMAIL = process.env.SUPERUSER_EMAIL || "";

/** Zapier: app connect URL. When set, "Connect with Zapier" links here; otherwise show "Coming soon". */
export const ZAPIER_APP_URL = process.env.NEXT_PUBLIC_ZAPIER_APP_URL || "";

/** Landing page: "Used by X+ creators" — set to real number when you have it, or leave empty to hide. */
export const LANDING_USER_COUNT = "";

/** Landing page: optional YouTube/Vimeo embed URL for 60-second demo video. Empty = hide video section. */
export const LANDING_VIDEO_URL = process.env.NEXT_PUBLIC_DEMO_VIDEO_URL || "";

/** Landing page: testimonial / social proof quotes. Replace with real user quotes when available. */
export const LANDING_TESTIMONIALS = [
  { quote: "Paste a blog link, click once, get LinkedIn + Twitter + Instagram ready. No more copy-paste.", attribution: "What RepostAI does", beforeAfter: "1 click → 7 posts" },
  { quote: "Train the AI on your writing samples so every output matches your tone, not generic AI speak.", attribution: "Brand voice feature", beforeAfter: "Sounds like you" },
  { quote: "YouTube transcript in, platform-native posts out. Works with text, URLs, PDFs, and videos.", attribution: "Multi-input support", beforeAfter: "Any content → posts" },
  { quote: "Free tier included. Starter at ₹299/mo — a fraction of what competitors charge.", attribution: "Built for India pricing", beforeAfter: "10x cheaper" },
] as const;

/** Display pricing (INR). Enforcement lives in `lib/billing/plan-entitlements.ts`. */
export const PLANS = {
  FREE: {
    name: "Free",
    monthlyPrice: 0,
    /** @deprecated Use plan-entitlements getEntitlements("free").repurposesPerMonth */
    repurposesPerMonth: 5,
    platforms: ["linkedin", "twitter_thread", "instagram"],
    brandVoices: 1,
    features: [
      "5 repurposes / month",
      "LinkedIn, Twitter/X, Instagram",
      "GPT-4o-mini",
      "1 brand voice",
      "2 photo captions / month",
      'Watermark: "Generated with RepostAI"',
    ],
  },
  STARTER: {
    name: "Starter",
    monthlyPrice: 299,
    annualPrice: 2899,
    repurposesPerMonth: 50,
    platforms: [
      "linkedin",
      "twitter_thread",
      "twitter_single",
      "instagram",
      "facebook",
      "email",
      "reddit",
      "tiktok",
      "whatsapp_status",
    ],
    brandVoices: 1,
    features: [
      "50 repurposes / month",
      "All 9 platforms",
      "GPT-4o-mini",
      "No watermark",
      "1 brand voice",
      "15 photo captions / month",
    ],
  },
  PRO: {
    name: "Pro",
    monthlyPrice: 799,
    annualPrice: 7999,
    repurposesPerMonth: 150,
    platforms: [
      "linkedin",
      "twitter_thread",
      "twitter_single",
      "instagram",
      "facebook",
      "email",
      "reddit",
      "tiktok",
      "whatsapp_status",
    ],
    brandVoices: 5,
    features: [
      "150 repurposes / month",
      "All 9 platforms",
      "Claude Haiku (enhanced AI)",
      "No watermark",
      "5 brand voices",
      "50 photo captions / month",
      "AI Content Starter",
      "Priority support",
    ],
  },
  AGENCY: {
    name: "Agency",
    monthlyPrice: 2499,
    annualPrice: 24999,
    repurposesPerMonth: 500,
    platforms: [
      "linkedin",
      "twitter_thread",
      "twitter_single",
      "instagram",
      "facebook",
      "email",
      "reddit",
      "tiktok",
      "whatsapp_status",
    ],
    brandVoices: 15,
    features: [
      "500 repurposes / month",
      "All 9 platforms",
      "Claude Sonnet (premium AI)",
      "No watermark",
      "15 brand voices",
      "200 photo captions / month",
      "AI Content Starter",
      "Team & API (roadmap)",
      "Dedicated support",
    ],
  },
} as const;

/** Multi-currency display pricing keyed by region. */
export const PLANS_PRICING: Record<string, { monthly: Record<string, number>; annual: Record<string, number> }> = {
  Free: { monthly: { in: 0, global: 0, eu: 0, uk: 0, latam: 0 }, annual: { in: 0, global: 0, eu: 0, uk: 0, latam: 0 } },
  Starter: {
    monthly: { in: 299, global: 5.99, eu: 5.99, uk: 4.99, latam: 5.99 },
    annual:  { in: 2899, global: 59, eu: 59, uk: 49, latam: 59 },
  },
  Pro: {
    monthly: { in: 799, global: 14.99, eu: 14.99, uk: 11.99, latam: 14.99 },
    annual:  { in: 7999, global: 149, eu: 149, uk: 119, latam: 149 },
  },
  Agency: {
    monthly: { in: 2499, global: 39.99, eu: 39.99, uk: 34.99, latam: 39.99 },
    annual:  { in: 24999, global: 399, eu: 399, uk: 349, latam: 399 },
  },
};

/** Viral hook style — how to open the first line (80% of engagement). */
export const HOOK_MODES = [
  { id: "default", name: "Auto (best fit)", description: "Let AI pick the best hook" },
  { id: "pattern_interrupt", name: "Pattern interrupt", description: '"95% of algo traders do this wrong..."' },
  { id: "story", name: "Story hook", description: '"I lost $3,200 in 3 hours. Here\'s what happened..."' },
  { id: "statistic", name: "Statistic hook", description: '"62% of creators burn out. I found the fix."' },
  { id: "fomo", name: "FOMO hook", description: '"Everyone\'s talking about this strategy. Here\'s why."' },
  { id: "controversy", name: "Controversy hook", description: '"Stop paper trading. It\'s wasting your time."' },
  { id: "sneak_peek", name: "Sneak peek hook", description: '"I spent 30 days testing this. Results shocked me."' },
] as const;

/** Content angle / format — how to frame the repurposed content (Reddit users often request this). */
export const CONTENT_ANGLES = [
  { id: "default", name: "Auto (best fit)", description: "Let AI pick the best angle" },
  { id: "insight", name: "Insight post", description: "Share a key takeaway or lesson learned" },
  { id: "story", name: "Story post", description: "Narrative format with personal anecdote" },
  { id: "howto", name: "How-to", description: "Step-by-step or tutorial style" },
  { id: "contrarian", name: "Contrarian take", description: "Challenge common beliefs or assumptions" },
  { id: "listicle", name: "Listicle", description: "Numbered list format (e.g. 5 lessons, 7 tips)" },
] as const;

export const SUPPORTED_PLATFORMS = [
  { id: "linkedin", name: "LinkedIn", icon: "linkedin", maxLength: 3000 },
  { id: "twitter_thread", name: "Twitter/X Thread", icon: "twitter", maxLength: 280 },
  { id: "twitter_single", name: "Twitter/X Post", icon: "twitter", maxLength: 280 },
  { id: "instagram", name: "Instagram Caption", icon: "instagram", maxLength: 2200 },
  { id: "facebook", name: "Facebook Post", icon: "facebook", maxLength: 63206 },
  { id: "email", name: "Email Newsletter", icon: "mail", maxLength: null },
  { id: "reddit", name: "Reddit Post", icon: "message-circle", maxLength: 40000 },
  { id: "tiktok", name: "TikTok Video Script", icon: "play", maxLength: 2200 },
  { id: "whatsapp_status", name: "WhatsApp Status", icon: "message-circle", maxLength: 700 },
] as const;

export const INPUT_TYPES = [
  { id: "text", name: "Paste Text", icon: "type", description: "Paste any text content" },
  { id: "url", name: "Blog URL", icon: "link", description: "Auto-scrape blog content" },
  { id: "youtube", name: "YouTube URL", icon: "youtube", description: "Auto-transcribe video" },
  { id: "pdf", name: "Upload PDF", icon: "file-text", description: "Extract text from PDF" },
] as const;

export const SUPPORTED_LANGUAGES = [
  { id: "en", name: "English", nativeName: "English", flag: "🇺🇸" },
  { id: "hi", name: "Hindi", nativeName: "हिन्दी", flag: "🇮🇳" },
  { id: "mr", name: "Marathi", nativeName: "मराठी", flag: "🇮🇳" },
  { id: "bn", name: "Bengali", nativeName: "বাংলা", flag: "🇮🇳" },
  { id: "te", name: "Telugu", nativeName: "తెలుగు", flag: "🇮🇳" },
  { id: "kn", name: "Kannada", nativeName: "ಕನ್ನಡ", flag: "🇮🇳" },
  { id: "or", name: "Odia", nativeName: "ଓଡ଼ିଆ", flag: "🇮🇳" },
  { id: "pa", name: "Punjabi", nativeName: "ਪੰਜਾਬੀ", flag: "🇮🇳" },
  { id: "es", name: "Spanish", nativeName: "Español", flag: "🇪🇸" },
  { id: "pt", name: "Portuguese", nativeName: "Português", flag: "🇧🇷" },
  { id: "fr", name: "French", nativeName: "Français", flag: "🇫🇷" },
] as const;

export const TONE_OPTIONS = [
  { id: "professional", name: "Professional", description: "Clean, authoritative, business-appropriate" },
  { id: "casual", name: "Casual", description: "Friendly, relatable, conversational" },
  { id: "humorous", name: "Humorous", description: "Witty, fun, entertaining" },
  { id: "inspirational", name: "Inspirational", description: "Motivating, uplifting, empowering" },
  { id: "educational", name: "Educational", description: "Informative, clear, structured" },
] as const;

export const LENGTH_OPTIONS = [
  { id: "short", name: "Short", words: 300, description: "~300 words, quick read" },
  { id: "medium", name: "Medium", words: 600, description: "~600 words, standard blog post" },
  { id: "long", name: "Long", words: 1000, description: "~1000+ words, in-depth article" },
] as const;

/** @deprecated Prefer getEntitlements() — kept for grep/docs; enforcement uses plan-entitlements. */
/** Humanization level for brand voice authenticity tuning */
export const HUMANIZATION_LEVELS = [
  { id: "casual", name: "Casual", description: "Friendly, conversational, approachable" },
  { id: "professional", name: "Professional", description: "Polished, authoritative, business-appropriate" },
  { id: "raw", name: "Raw / Unfiltered", description: "Direct, unfiltered, authentic" },
] as const;

/** Legacy export; real limits in `@/lib/billing/plan-entitlements`. */
export const FREE_TIER_MONTHLY_LIMIT = 5;

/** Watermark appended to free-tier outputs. Pro/Agency remove it. */
export const FREE_TIER_WATERMARK =
  "\n\nGenerated with RepostAI - repostai.com";
/** Short suffix for Twitter (280 char cap). */
export const FREE_TIER_WATERMARK_SHORT = " repostai.com";

/** Platform IDs allowed on Free plan (3 platforms: LinkedIn, Twitter/X thread, Instagram). */
export const FREE_PLATFORM_IDS = [
  "linkedin",
  "twitter_thread",
  "instagram",
] as const;
