import { z } from "zod";
import { outputLanguageSchema } from "@/lib/validators/output-language";

export const repurposeSchema = z.object({
  inputType: z.enum(["text", "url", "youtube", "pdf"]),
  content: z
    .string()
    .min(1, "Content is required")
    .max(50000, "Content is too long (max 50,000 characters)"),
  url: z.string().url().optional(),
  platforms: z
    .array(
      z.enum([
        "linkedin",
        "twitter_thread",
        "twitter_single",
        "instagram",
        "facebook",
        "email",
        "reddit",
        "tiktok",
        "whatsapp_status",
        "telegram",
      ])
    )
    .min(1, "Select at least one platform"),
  brandVoiceId: z.string().uuid().optional(),
  outputLanguage: outputLanguageSchema.default("en"),
  userIntent: z.string().max(300).optional(),
  contentAngle: z.enum(["default", "insight", "story", "howto", "contrarian", "listicle"]).optional(),
  hookMode: z.enum(["default", "pattern_interrupt", "story", "statistic", "fomo", "controversy", "sneak_peek"]).optional(),
  /** When true with brandVoiceId, response includes baselineOutputs (default tone) for side-by-side compare; counts as one repurpose. */
  includeBaselineComparison: z.boolean().optional(),
});

export type RepurposeInput = z.infer<typeof repurposeSchema>;
