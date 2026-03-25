export type Platform =
  | "linkedin"
  | "twitter_thread"
  | "twitter_single"
  | "instagram"
  | "facebook"
  | "reddit"
  | "email"
  | "tiktok"
  | "whatsapp_status";

export type Language = "en" | "hi" | "es" | "pt" | "fr";

export interface ContentBrief {
  coreMessage:  string;
  keyPoints:    string[];
  audience:     string;
  tone:         string;
  contentType:  "blog_post" | "youtube" | "article" | "thread" | "text";
  rawContent:   string;
}

export interface BrandVoice {
  samples: string;
  persona?: string;
  /** When passed from DB, steers Claude/OpenAI persona extraction. */
  humanization_level?: string | null;
  imperfection_mode?: boolean | null;
  personal_story_injection?: boolean | null;
}

export interface RepurposeRequest {
  content:     string;
  platforms:   Platform[];
  language:    Language;
  brandVoice?: BrandVoice;
}

export interface PlatformOutput {
  platform:   Platform;
  content:    string;
  tweets?:    string[];
  subject?:   string;
  title?:     string;
  hashtags?:  string[];
  charCount?: number;
  passed?:    boolean;
}

export interface RepurposeResult {
  brief:      ContentBrief;
  outputs:    PlatformOutput[];
  durationMs: number;
}
