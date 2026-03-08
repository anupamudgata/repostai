import { z } from "zod";

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
      ])
    )
    .min(1, "Select at least one platform"),
  brandVoiceId: z.string().uuid().optional(),
  outputLanguage: z.enum(["en", "hi", "es"]).default("en"),
  userIntent: z.string().max(300).optional(),
});

export type RepurposeInput = z.infer<typeof repurposeSchema>;
