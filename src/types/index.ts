export type Plan = "free" | "pro" | "agency";

export type InputType = "text" | "url" | "youtube" | "pdf";

export type OutputLanguage = "en" | "hi" | "es" | "pt" | "fr";

export type ContentTone =
  | "professional"
  | "casual"
  | "humorous"
  | "inspirational"
  | "educational";

export type ContentLength = "short" | "medium" | "long";

export interface CreateContentRequest {
  topic: string;
  tone: ContentTone;
  length: ContentLength;
  audience: string;
  outputLanguage: OutputLanguage;
  brandVoiceId?: string;
}

export interface CreatedPost {
  id: string;
  user_id: string;
  topic: string;
  tone: ContentTone;
  length: ContentLength;
  audience: string;
  output_language: OutputLanguage;
  generated_content: string;
  brand_voice_id: string | null;
  created_at: string;
}

export type Platform =
  | "linkedin"
  | "twitter_thread"
  | "twitter_single"
  | "instagram"
  | "facebook"
  | "email"
  | "reddit"
  | "tiktok"
  | "whatsapp_status";

export interface User {
  id: string;
  email: string;
  name: string | null;
  avatar_url: string | null;
  plan: Plan;
  stripe_customer_id: string | null;
  created_at: string;
}

export interface Subscription {
  id: string;
  user_id: string;
  stripe_subscription_id: string;
  plan: Plan;
  status: "active" | "canceled" | "past_due" | "trialing";
  current_period_end: string;
  created_at: string;
}

export type HumanizationLevel = "casual" | "professional" | "raw";

export interface BrandVoice {
  id: string;
  user_id: string;
  name: string;
  /** @deprecated use samples */
  sample_text?: string;
  samples?: string;
  description: string | null;
  created_at: string;
  humanization_level?: HumanizationLevel | null;
  imperfection_mode?: boolean | null;
  personal_story_injection?: boolean | null;
}

export interface RepurposeJob {
  id: string;
  user_id: string;
  input_type: InputType;
  input_content: string;
  input_url: string | null;
  brand_voice_id: string | null;
  output_language: OutputLanguage;
  created_at: string;
}

export interface RepurposeOutput {
  id: string;
  job_id: string;
  platform: Platform;
  generated_content: string;
  edited_content: string | null;
  created_at: string;
}

export interface UsageRecord {
  id: string;
  user_id: string;
  month: string; // YYYY-MM format
  repurpose_count: number;
}

export interface RepurposeRequest {
  inputType: InputType;
  content: string;
  url?: string;
  platforms: Platform[];
  brandVoiceId?: string;
  outputLanguage?: OutputLanguage;
}

export interface RepurposeResponse {
  jobId: string;
  outputs: {
    platform: Platform;
    content: string;
  }[];
}
