import OpenAI from "openai";

let _client: OpenAI | null = null;

function getClient(): OpenAI {
  if (!_client) {
    const key = process.env.OPENAI_API_KEY;
    if (!key) {
      throw new Error("Missing OPENAI_API_KEY. Set OPENAI_API_KEY environment variable.");
    }
    _client = new OpenAI({ apiKey: key, timeout: 60_000 });
  }
  return _client;
}

/** Lazy-initialized OpenAI client. Defers API key check until first use so build succeeds without env. */
export const openai = new Proxy({} as OpenAI, {
  get(_, prop) {
    return (getClient() as unknown as Record<string, unknown>)[prop as string];
  },
});
