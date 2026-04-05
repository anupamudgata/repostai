import type { Platform as StreamPlatform } from "@/lib/ai/types";
import type { Platform as AppPlatform } from "@/types";

export interface RegionalLanguageConfig {
  code: string;
  name: string;
  nativeName: string;
  script: string;
  mixName: string;
  codeSwitchRatio: string;
  formalPronoun: string;
  casualPronoun: string;
  englishTermsNote: string;
  commonNativeWords: string;
  scriptExamples: { correct: string[]; wrong: string[] };
  culturalContext: string;
  slangVocabulary: string;
  openingVariety: string;
  fewShotExamples: string;
  platformBlocks: Record<string, string>;
  platformOverrides: Partial<Record<StreamPlatform, string>>;
  qcRules: string;
  extractorGuard: string;
  photoCaptionHint: string;
}

export interface RegionalPromptModule {
  systemPrompt: string;
  getStreamSystemPrompt(): string;
  getStreamLanguageInstruction(tonePreset?: string): string;
  getPlatformSupplementForStream(platform: StreamPlatform): string;
  buildRepurposeAppend(platforms: AppPlatform[]): string;
  qcRules: string;
  extractorGuard: string;
  photoCaptionHint: string;
  getPhotoCaptionSystemPrompt(): string;
  platformOverrides: Partial<Record<StreamPlatform, string>>;
  slangVocabulary: string;
  culturalContext: string;
  openingVariety: string;
}
