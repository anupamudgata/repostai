import { z } from "zod";

export const photoPostPlatformSchema = z.enum([
  "instagram",
  "facebook",
  "twitter",
  "linkedin",
]);

export const photoCaptionsBodySchema = z.object({
  photoId: z.string().uuid(),
  platforms: z.array(photoPostPlatformSchema).min(1),
  outputLanguage: z.enum(["en", "hi"]).optional().default("en"),
});

export const photoPostBodySchema = z.object({
  captionRunId: z.string().uuid(),
  captions: z.record(z.string(), z.string()).optional(),
  scheduledFor: z.string().optional(),
});
