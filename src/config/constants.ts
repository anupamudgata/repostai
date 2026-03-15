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
export const LANDING_USER_COUNT = "5,000+";

/** Landing page: optional YouTube/Vimeo embed URL for 60-second demo video. Empty = hide video section. */
export const LANDING_VIDEO_URL = process.env.NEXT_PUBLIC_DEMO_VIDEO_URL || "";

/** Landing page: testimonial / social proof quotes. Replace with real user quotes when available. */
export const LANDING_TESTIMONIALS = [
  { quote: "Before: 3+ hours rewriting one post for every platform. After: under 3 minutes. Game changer.", attribution: "Content creator", beforeAfter: "3+ hrs → 3 min" },
  { quote: "I paste the blog link, click once, and get LinkedIn, Twitter, and Instagram ready. No more copy-paste hell.", attribution: "Marketing lead", beforeAfter: "5+ hours saved/week" },
  { quote: "The brand voice feature actually makes it sound like me. First AI tool that doesn't feel robotic.", attribution: "Founder", beforeAfter: "Sounds like me" },
  { quote: "From one YouTube video to 7 platform-ready posts in under a minute. Insane.", attribution: "Creator", beforeAfter: "1 video → 7 posts" },
] as const;

export const PLANS = {
  FREE: {
    name: "Free",
    monthlyPrice: 0,
    repurposesPerMonth: 5,
    platforms: ["linkedin", "twitter_thread", "twitter_single", "email"],
    brandVoices: 0,
    features: [
      "5 repurposes/month",
      "LinkedIn, Twitter/X, Email",
      "Basic formatting",
    ],
  },
  PRO: {
    name: "Pro",
    monthlyPrice: 19,
    annualPrice: 15,
    repurposesPerMonth: -1, // unlimited
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
      "Unlimited repurposes",
      "AI Content Starter (topic to post)",
      "All 9+ platforms",
      "5 languages (EN, HI, ES, PT, FR)",
      "Brand voice training (3 voices)",
      "One-click post to Twitter/X (LinkedIn coming soon)",
      "Schedule posts (Twitter/X; LinkedIn coming soon)",
      "Full history",
      "Priority speed",
    ],
  },
  AGENCY: {
    name: "Agency",
    monthlyPrice: 49,
    annualPrice: 39,
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
    brandVoices: 10,
    features: [
      "Everything in Pro",
      "AI Content Starter (unlimited)",
      "10 brand voices",
      "5 languages (EN, HI, ES, PT, FR)",
      "One-click post & schedule (Twitter/X; LinkedIn coming soon)",
      "CSV export",
      "API access",
      "Priority support",
    ],
  },
} as const;

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

export const FREE_TIER_MONTHLY_LIMIT = 5;

/** Platform IDs allowed on Free plan. Pro/Agency get all platforms. */
export const FREE_PLATFORM_IDS = [
  "linkedin",
  "twitter_thread",
  "twitter_single",
  "email",
] as const;
