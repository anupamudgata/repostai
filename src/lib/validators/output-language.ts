import { z } from "zod";

/** Must match `OutputLanguage` in `@/types` and DB `output_language` check constraints. */
export const OUTPUT_LANGUAGE_VALUES = [
  "en",
  "hi",
  "mr",
  "bn",
  "te",
  "kn",
  "or",
  "pa",
  "es",
  "pt",
  "fr",
] as const;

export const outputLanguageSchema = z.enum(OUTPUT_LANGUAGE_VALUES);
