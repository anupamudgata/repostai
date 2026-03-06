import { z } from "zod";

export const createContentSchema = z.object({
  topic: z
    .string()
    .min(3, "Topic must be at least 3 characters")
    .max(500, "Topic is too long (max 500 characters)"),
  tone: z.enum([
    "professional",
    "casual",
    "humorous",
    "inspirational",
    "educational",
  ]),
  length: z.enum(["short", "medium", "long"]),
  audience: z
    .string()
    .min(2, "Describe your target audience")
    .max(200, "Audience description is too long"),
  outputLanguage: z.enum(["en", "hi", "es"]).default("en"),
  brandVoiceId: z.string().uuid().optional(),
});

export type CreateContentInput = z.infer<typeof createContentSchema>;
