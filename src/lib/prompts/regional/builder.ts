import type { Platform as AppPlatform } from "@/types";
import type { Platform as StreamPlatform } from "@/lib/ai/types";
import type { RegionalLanguageConfig, RegionalPromptModule } from "./types";
import { getCurrentCulturalHooks } from "../cultural-hooks";

export function getToneInstruction(tonePreset: string | undefined, cfg: RegionalLanguageConfig): string {
  switch (tonePreset) {
    case "professional":
      return `Tone: Professional — use formal pronouns (${cfg.formalPronoun}), measured language, authority-based openers, no slang except sparingly.`;
    case "gen_z":
      return `Tone: Gen-Z — ultra-casual, meme-aware, irony, short punchy sentences, internet-first language, energy over formality. Use the youngest-sounding slang from the toolkit.`;
    case "casual":
    default:
      return `Tone: Casual — use informal pronouns (${cfg.casualPronoun}), slang from the toolkit, lighter humor, conversational openers. Posts should feel like texting a friend.`;
  }
}

function appPlatformToBlockKey(p: AppPlatform): string | null {
  switch (p) {
    case "linkedin": return "linkedin";
    case "instagram": return "instagram";
    case "twitter_thread":
    case "twitter_single": return "twitter";
    case "facebook": return "facebook";
    case "whatsapp_status": return "whatsapp";
    case "email": return "email";
    case "reddit": return "reddit";
    case "tiktok": return "tiktok";
    default: return null;
  }
}

export function buildRegionalModule(cfg: RegionalLanguageConfig): RegionalPromptModule {
  const systemPrompt = `आप ${cfg.nativeName} creators के लिए content repurposing में expert हैं।

🎯 GOAL: Write EXACTLY how ${cfg.name}-speaking Indians post on social — natural ${cfg.mixName}. Not textbook ${cfg.name}. Not pure English.

📋 RULES (non-negotiable):

1) CODE-SWITCHING — Every sentence should have a natural mix (${cfg.codeSwitchRatio}).
   ${cfg.scriptExamples.correct.map(e => `✅ "${e}"`).join("\n   ")}
   ${cfg.scriptExamples.wrong.map(e => `❌ "${e}"`).join("\n   ")}

2) ENGLISH (Latin script) ONLY for: ${cfg.englishTermsNote}

3) ${cfg.name.toUpperCase()} words MUST be in ${cfg.script} script — NEVER Romanized:
   Common words that MUST be in ${cfg.script}: ${cfg.commonNativeWords}

4) TONE BY SURFACE:
   - LinkedIn / email: professional + personable (${cfg.formalPronoun}).
   - Instagram / Facebook: casual (${cfg.casualPronoun} OK where natural).
   - X thread: tight, insightful, mixed register.
   - Reddit: authentic, value-first; usually NO emojis, no marketing voice.
   - WhatsApp status: very short, direct, light emojis.

5) HASHTAGS: Mix ${cfg.name} + English tags that people actually search. No nonsense filler.

6) NEVER: Google-Translate stiffness | formal literary ${cfg.name} nobody speaks online | only-English when the brief is ${cfg.name} output | wrong ${cfg.script} spelling.

JSON keys for platforms stay ENGLISH (linkedin, instagram, …). Only the string VALUES are post text in ${cfg.mixName}.`;

  const regionalModule: RegionalPromptModule = {
    systemPrompt,
    slangVocabulary: cfg.slangVocabulary,
    culturalContext: cfg.culturalContext,
    openingVariety: cfg.openingVariety,
    qcRules: cfg.qcRules,
    extractorGuard: cfg.extractorGuard,
    photoCaptionHint: cfg.photoCaptionHint,
    platformOverrides: cfg.platformOverrides,

    getStreamSystemPrompt() {
      return systemPrompt;
    },

    getStreamLanguageInstruction(tonePreset?: string) {
      const toneInstruction = getToneInstruction(tonePreset, cfg);
      return `LANGUAGE — ${cfg.mixName.toUpperCase()} (Indian social):
CRITICAL: ${cfg.name} words MUST be in ${cfg.script} script. NEVER write ${cfg.name} in Roman/Latin script. English tech/platform terms stay in Latin script (startup, content, AI, brand, growth, LinkedIn).
Mix ${cfg.script} ${cfg.name} with English naturally (${cfg.codeSwitchRatio}). Sound like real Indian creators posting on social — NOT textbook ${cfg.name}, NOT Google Translate, NOT 100% English.
Tone: LinkedIn/email → ${cfg.formalPronoun} + warm professional. Instagram/Facebook → casual ${cfg.casualPronoun} where natural. X → punchy mix. Reddit → helpful, no marketing voice, usually no emojis. WhatsApp → SHORT (3-5 lines max), no hashtags.
Hashtags: mix ${cfg.name} + English discoverable tags when the format uses hashtags (NOT on WhatsApp).

${cfg.slangVocabulary}

${cfg.culturalContext}

${cfg.openingVariety}

${toneInstruction}`;
    },

    getPlatformSupplementForStream(platform: StreamPlatform) {
      const key = platform === "twitter_thread" || platform === "twitter_single" ? "twitter" : platform;
      const block = cfg.platformBlocks[key];
      return block ? `\n\n${block}` : "";
    },

    buildRepurposeAppend(platforms: AppPlatform[]) {
      const keys = new Set<string>();
      for (const p of platforms) {
        const k = appPlatformToBlockKey(p);
        if (k) keys.add(k);
      }
      const sections = [...keys]
        .map((k) => cfg.platformBlocks[k])
        .filter(Boolean)
        .join("\n\n");
      return `${systemPrompt}

${cfg.slangVocabulary}

${cfg.culturalContext}

${cfg.openingVariety}

---
${cfg.mixName.toUpperCase()} RULES BY PLATFORM (apply only to relevant keys in your JSON):
${sections || cfg.platformBlocks.linkedin || ""}
${cfg.fewShotExamples}

CURRENT CULTURAL CONTEXT (weave naturally if relevant):
${getCurrentCulturalHooks()}`;
    },

    getPhotoCaptionSystemPrompt() {
      return `${systemPrompt}

${cfg.culturalContext}

PHOTO CAPTIONS — write captions that feel like an Indian creator naturally posting about this image in ${cfg.mixName}. Match platform conventions. Keep it authentic, not translated.`;
    },
  };

  return regionalModule;
}
