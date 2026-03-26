import type { RegionalPromptModule } from "./types";
import { buildRegionalModule } from "./builder";
import { MARATHI_CONFIG } from "./marathi";
import { BENGALI_CONFIG } from "./bengali";
import { TELUGU_CONFIG } from "./telugu";
import { KANNADA_CONFIG } from "./kannada";
import { ODIA_CONFIG } from "./odia";
import { PUNJABI_CONFIG } from "./punjabi";
import type { Platform as StreamPlatform } from "@/lib/ai/types";
import type { Platform as AppPlatform } from "@/types";
import {
  HINDI_SYSTEM_PROMPT,
  HINDI_SLANG_VOCABULARY,
  HINDI_CULTURAL_CONTEXT,
  HINDI_OPENING_VARIETY,
  HINDI_PHOTO_CAPTION_HINT,
  getHindiStreamSystemPrompt,
  getHindiStreamLanguageInstruction,
  getHindiPlatformSupplementForStream,
  getHindiPhotoCaptionSystemPrompt,
  buildHindiRepurposeAppend,
} from "@/lib/prompts/hindi";

const HINDI_QC_RULES = `
HINDI/HINGLISH QUALITY RULES:
- Devanagari consistency: Hindi words MUST be in Devanagari. Romanized Hindi = CRITICAL FAIL.
- Code-switching: English tech terms OK, full English sentences = FAIL.
- Cultural authenticity: Must sound like a real Indian creator, not translated English.
- Platform formality: LinkedIn = professional आप. Instagram = casual तुम/यार.
- RELAX English-centric rules: "Never start with I" does NOT apply to Hindi.`;

const HINDI_EXTRACTOR_GUARD = `
HINDI OUTPUT CONTEXT:
- The extracted brief will be used to generate Hinglish (Hindi + English) social content.
- Preserve Hindi words, idioms, cultural references, Hinglish phrases naturally in coreMessage and keyPoints.
- Keep JSON keys in English. Values can be in Hinglish if the source is Hindi/Hinglish.
- Preserve Indian cultural context: festival references, cricket analogies, Bollywood mentions, desi humor.`;

const HINDI_PLATFORM_OVERRIDES: Partial<Record<StreamPlatform, string>> = {
  linkedin: `HINDI-SPECIFIC LINKEDIN RULES:
- "Never start with I" does NOT apply — Hindi first-person "मैंने" or "मेरा" is natural
- End with Hindi engagement: "आपका अनुभव क्या रहा?", "Comments में बताइए"
- Use आप-based professional Hinglish`,
  instagram: `HINDI-SPECIFIC INSTAGRAM:
- CTA in Hindi: "Save करो", "Tag करो उस दोस्त को", "Comment में बताओ"
- Casual तुम/यार tone for relatability`,
  tiktok: `HINDI-SPECIFIC TIKTOK SCRIPT:
- Spoken Hinglish hooks: "सुनो ये ज़रूरी है", "रुको ज़रा", "ये देखो पहले"
- End CTA: "Follow करो", "Save करो"`,
};

const hindiModule: RegionalPromptModule = {
  systemPrompt: HINDI_SYSTEM_PROMPT,
  slangVocabulary: HINDI_SLANG_VOCABULARY,
  culturalContext: HINDI_CULTURAL_CONTEXT,
  openingVariety: HINDI_OPENING_VARIETY,
  qcRules: HINDI_QC_RULES,
  extractorGuard: HINDI_EXTRACTOR_GUARD,
  photoCaptionHint: HINDI_PHOTO_CAPTION_HINT,
  platformOverrides: HINDI_PLATFORM_OVERRIDES,
  getStreamSystemPrompt: getHindiStreamSystemPrompt,
  getStreamLanguageInstruction: getHindiStreamLanguageInstruction,
  getPlatformSupplementForStream: getHindiPlatformSupplementForStream,
  buildRepurposeAppend: buildHindiRepurposeAppend,
  getPhotoCaptionSystemPrompt: getHindiPhotoCaptionSystemPrompt,
};

const marathiModule = buildRegionalModule(MARATHI_CONFIG);
const bengaliModule = buildRegionalModule(BENGALI_CONFIG);
const teluguModule = buildRegionalModule(TELUGU_CONFIG);
const kannadaModule = buildRegionalModule(KANNADA_CONFIG);
const odiaModule = buildRegionalModule(ODIA_CONFIG);
const punjabiModule = buildRegionalModule(PUNJABI_CONFIG);

const REGIONAL_MODULES: Record<string, RegionalPromptModule> = {
  hi: hindiModule,
  mr: marathiModule,
  bn: bengaliModule,
  te: teluguModule,
  kn: kannadaModule,
  or: odiaModule,
  pa: punjabiModule,
};

/**
 * Returns the regional prompt module for an Indian language code, or null for non-Indian languages.
 * Works for: hi, mr, bn, te, kn, or, pa
 */
export function getRegionalPrompts(langCode: string): RegionalPromptModule | null {
  return REGIONAL_MODULES[langCode] ?? null;
}

export type { RegionalPromptModule } from "./types";
