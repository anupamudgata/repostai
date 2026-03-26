import Anthropic from "@anthropic-ai/sdk";

let _client: Anthropic | null = null;

function getClient(): Anthropic {
  if (!_client) {
    const key = process.env.ANTHROPIC_API_KEY;
    if (!key?.trim()) {
      throw new Error("Missing ANTHROPIC_API_KEY. Set it to use Claude for brand voice.");
    }
    _client = new Anthropic({ apiKey: key, timeout: 120_000 });
  }
  return _client;
}

/** Lazy Anthropic client; only instantiate when ANTHROPIC_API_KEY is set. */
export function getAnthropicClient(): Anthropic | null {
  if (!process.env.ANTHROPIC_API_KEY?.trim()) return null;
  return getClient();
}

/** Shown when repurpose/stream requests Hindi or another Indian regional language but the key is missing. */
export const ANTHROPIC_REQUIRED_FOR_INDIAN_LANGUAGES =
  "ANTHROPIC_API_KEY is required for Hindi and regional Indian language outputs (Odia, Marathi, Bengali, etc.). OpenAI is not used for these languages.";
