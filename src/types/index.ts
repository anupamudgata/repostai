export type Plan = "free" | "pro" | "agency";

export type InputType = "text" | "url" | "youtube" | "pdf";

export type OutputLanguage = "en" | "hi" | "es";

export type Platform =
  | "linkedin"
  | "twitter_thread"
  | "twitter_single"
  | "instagram"
  | "facebook"
  | "email"
  | "reddit";

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

export interface BrandVoice {
  id: string;
  user_id: string;
  name: string;
  sample_text: string;
  description: string | null;
  created_at: string;
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
