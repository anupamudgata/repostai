import { z } from "zod";
import { outputLanguageSchema } from "@/lib/validators/output-language";

export const photoPostPlatformSchema = z.enum([
  "instagram",
  "facebook",
  "twitter",
  "linkedin",
]);

export const photoCaptionsBodySchema = z.object({
  photoId: z.string().uuid(),
  platforms: z.array(photoPostPlatformSchema).min(1),
  outputLanguage: outputLanguageSchema.optional().default("en"),
});

export const photoPostBodySchema = z.object({
  captionRunId: z.string().uuid(),
  captions: z.record(z.string(), z.string()).optional(),
  scheduledFor: z.string().optional(),
});
