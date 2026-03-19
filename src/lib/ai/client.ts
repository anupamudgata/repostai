import OpenAI from "openai";

/** Single OpenAI client instance for the app. Reduces memory and centralizes API key management. */
export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  timeout: 60_000,
});
