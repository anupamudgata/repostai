// src/lib/platform-display.ts
// FIX #10: Single source of truth for platform names
// Import from here everywhere — never hardcode "twitter" or "Twitter/X" inline

export const PLATFORM_DISPLAY: Record<string, {
  label:    string;   // "Twitter / X" — shown in UI cards
  short:    string;   // "X" — shown in badges
  color:    string;
  bg:       string;
  icon:     string;
}> = {
  linkedin: {
    label: "LinkedIn",
    short: "LinkedIn",
    color: "#0A66C2",
    bg:    "#EBF5FF",
    icon:  "in",
  },
  twitter: {
    label: "Twitter / X",
    short: "X",
    color: "#0F172A",
    bg:    "#F1F5F9",
    icon:  "𝕏",
  },
  twitter_thread: {
    label: "Twitter / X Thread",
    short: "X Thread",
    color: "#0F172A",
    bg:    "#F1F5F9",
    icon:  "𝕏",
  },
  twitter_single: {
    label: "Twitter / X Post",
    short: "X Post",
    color: "#0F172A",
    bg:    "#F1F5F9",
    icon:  "𝕏",
  },
  instagram: {
    label: "Instagram",
    short: "IG",
    color: "#C13584",
    bg:    "#FDF2F8",
    icon:  "IG",
  },
  facebook: {
    label: "Facebook",
    short: "FB",
    color: "#1877F2",
    bg:    "#EFF6FF",
    icon:  "f",
  },
  reddit: {
    label: "Reddit",
    short: "Reddit",
    color: "#FF4500",
    bg:    "#FFF7ED",
    icon:  "r/",
  },
  email: {
    label: "Email Newsletter",
    short: "Email",
    color: "#059669",
    bg:    "#ECFDF5",
    icon:  "@",
  },
  tiktok: {
    label: "TikTok",
    short: "TT",
    color: "#000000",
    bg:    "#F9FAFB",
    icon:  "TT",
  },
  whatsapp: {
    label: "WhatsApp",
    short: "WA",
    color: "#25D366",
    bg:    "#F0FDF4",
    icon:  "WA",
  },
};

// Get display name — falls back to capitalised platform ID if not found
export function getPlatformLabel(platform: string): string {
  return PLATFORM_DISPLAY[platform]?.label
    ?? platform.charAt(0).toUpperCase() + platform.slice(1).replace(/_/g, " ");
}

export function getPlatformShort(platform: string): string {
  return PLATFORM_DISPLAY[platform]?.short ?? platform.toUpperCase();
}

export function getPlatformColor(platform: string): string {
  return PLATFORM_DISPLAY[platform]?.color ?? "#6B7280";
}

export function getPlatformBg(platform: string): string {
  return PLATFORM_DISPLAY[platform]?.bg ?? "#F3F4F6";
}

export function getPlatformIcon(platform: string): string {
  return PLATFORM_DISPLAY[platform]?.icon ?? platform[0]?.toUpperCase() ?? "?";
}
