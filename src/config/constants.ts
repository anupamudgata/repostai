export const APP_NAME = "RepostAI";
export const APP_DESCRIPTION =
  "Paste one piece of content. Get 10+ ready-to-post versions for every platform. Under 60 seconds.";
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

/** Support / contact email used in footer, settings, and legal pages. */
export const SUPPORT_EMAIL = "support@repostai.com";

/** Superuser email: bypasses free limits, gets Pro plan everywhere (repurpose, stream, create, nav). */
export const SUPERUSER_EMAIL = "anupam.udgata@gmail.com";

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
  { quote: "Free tier included. Pro starts at ₹499/mo — a fraction of what competitors charge.", attribution: "Built for India pricing", beforeAfter: "10x cheaper" },
] as const;

/** Display pricing (INR). Enforcement lives in `lib/billing/plan-entitlements.ts`. */
export const PLANS = {
  FREE: {
    name: "Free",
    monthlyPrice: 0,
    /** @deprecated Use plan-entitlements getEntitlements("free").repurposesPerMonth */
    repurposesPerMonth: 10,
    platforms: ["linkedin", "twitter_thread", "twitter_single", "instagram"],
    brandVoices: 1,
    features: [
      "10 repurposes / month",
      "LinkedIn, Twitter/X, Instagram",
      "GPT-4o-mini",
      "1 brand voice",
      'Watermark: "Generated with RepostAI - repostai.com"',
    ],
  },
  STARTER: {
    name: "Starter",
    monthlyPrice: 199,
    annualPrice: 1899,
    repurposesPerMonth: 10,
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
      "10 repurposes / month",
      "All 9 platforms",
      "GPT-4o-mini",
      "No watermark",
      "1 brand voice",
    ],
  },
  PRO: {
    name: "Pro",
    monthlyPrice: 499,
    annualPrice: 4999,
    repurposesPerMonth: 60,
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
    brandVoices: 3,
    features: [
      "60 repurposes / month",
      "All 9 platforms",
      "Claude Sonnet (premium AI)",
      "No watermark",
      "3 brand voices",
      "AI Content Starter",
      "Priority support & advanced analytics",
    ],
  },
  AGENCY: {
    name: "Agency",
    monthlyPrice: 1499,
    annualPrice: 14999,
    repurposesPerMonth: -1,
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
      "Unlimited repurposes",
      "All 9 platforms",
      "Claude Sonnet",
      "5 brand voices",
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
    monthly: { in: 199, global: 4.99, eu: 4.99, uk: 3.99, latam: 4.99 },
    annual:  { in: 1899, global: 49, eu: 49, uk: 39, latam: 49 },
  },
  Pro: {
    monthly: { in: 499, global: 9.99, eu: 9.99, uk: 7.99, latam: 9.99 },
    annual:  { in: 4999, global: 99, eu: 99, uk: 79, latam: 99 },
  },
  Agency: {
    monthly: { in: 1499, global: 29.99, eu: 29.99, uk: 24.99, latam: 29.99 },
    annual:  { in: 14999, global: 299, eu: 299, uk: 249, latam: 299 },
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
export const FREE_TIER_MONTHLY_LIMIT = 10;

/** Watermark appended to free-tier outputs. Pro/Agency remove it. */
export const FREE_TIER_WATERMARK =
  "\n\nGenerated with RepostAI - repostai.com";
/** Short suffix for Twitter (280 char cap). */
export const FREE_TIER_WATERMARK_SHORT = " repostai.com";

/** Platform IDs allowed on Free plan (3 product surfaces: LI, Twitter, IG). */
export const FREE_PLATFORM_IDS = [
  "linkedin",
  "twitter_thread",
  "twitter_single",
  "instagram",
] as const;
