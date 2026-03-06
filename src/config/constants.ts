export const APP_NAME = "RepostAI";
export const APP_DESCRIPTION =
  "Paste one piece of content. Get 10+ ready-to-post versions for every platform. Under 60 seconds.";
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export const PLANS = {
  FREE: {
    name: "Free",
    monthlyPrice: 0,
    repurposesPerMonth: 5,
    platforms: ["linkedin", "twitter", "email"],
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
      "twitter",
      "instagram",
      "facebook",
      "email",
      "reddit",
    ],
    brandVoices: 3,
    features: [
      "Unlimited repurposes",
      "AI Content Starter (topic to post)",
      "All 7+ platforms",
      "3 languages (EN, HI, ES)",
      "Brand voice training (3 voices)",
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
      "twitter",
      "instagram",
      "facebook",
      "email",
      "reddit",
    ],
    brandVoices: 10,
    features: [
      "Everything in Pro",
      "AI Content Starter (unlimited)",
      "10 brand voices",
      "3 languages (EN, HI, ES)",
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
