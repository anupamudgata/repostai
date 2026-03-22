#!/usr/bin/env node
/**
 * Reports how many known env keys are missing or empty in .env.local (no secret values printed).
 * Usage: node scripts/check-env-keys.mjs
 */
import { readFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");
const envPath = resolve(root, ".env.local");

function parseEnvFile(path) {
  const out = {};
  if (!existsSync(path)) return out;
  const text = readFileSync(path, "utf8");
  for (const line of text.split("\n")) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const eq = t.indexOf("=");
    if (eq <= 0) continue;
    const key = t.slice(0, eq).trim();
    let val = t.slice(eq + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    out[key] = val;
  }
  return out;
}

const isSet = (fileEnv, key) => {
  const v = fileEnv[key];
  return typeof v === "string" && v.trim().length > 0;
};

const CORE = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "OPENAI_API_KEY",
  "NEXT_PUBLIC_APP_URL",
];

const INTEGRATIONS = [
  "ANTHROPIC_API_KEY",
  "UPSTASH_REDIS_REST_URL",
  "UPSTASH_REDIS_REST_TOKEN",
  "RESEND_API_KEY",
  "RESEND_FROM_EMAIL",
  "ENCRYPTION_SECRET",
  "CRON_SECRET",
  "TWITTER_CLIENT_ID",
  "TWITTER_CLIENT_SECRET",
  "LINKEDIN_CLIENT_ID",
  "LINKEDIN_CLIENT_SECRET",
  "RAZORPAY_KEY_ID",
  "RAZORPAY_KEY_SECRET",
  "NEXT_PUBLIC_RAZORPAY_KEY_ID",
  "RAZORPAY_WEBHOOK_SECRET",
  "RAZORPAY_PLAN_STARTER_MONTHLY",
  "RAZORPAY_PLAN_STARTER_ANNUAL",
  "STRIPE_SECRET_KEY",
  "STRIPE_WEBHOOK_SECRET",
  "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY",
  "NEXT_PUBLIC_SENTRY_DSN",
  "SENTRY_AUTH_TOKEN",
  "NEXT_PUBLIC_POSTHOG_KEY",
  "REDDIT_CLIENT_ID",
  "REDDIT_CLIENT_SECRET",
  "R2_ACCOUNT_ID",
  "R2_ACCESS_KEY_ID",
  "R2_SECRET_ACCESS_KEY",
  "R2_BUCKET_NAME",
  "R2_PUBLIC_URL",
  "FACEBOOK_APP_ID",
  "FACEBOOK_APP_SECRET",
];

const fileEnv = parseEnvFile(envPath);
const missingCore = CORE.filter((k) => !isSet(fileEnv, k));
const missingInt = INTEGRATIONS.filter((k) => !isSet(fileEnv, k));

console.log(`Env file: ${existsSync(envPath) ? ".env.local (found)" : ".env.local (missing)"}`);
console.log("");
console.log(
  `Core (5 essentials): ${CORE.length - missingCore.length}/${CORE.length} set, ${missingCore.length} pending`
);
if (missingCore.length) console.log("  Missing:", missingCore.join(", "));
console.log("");
console.log(
  `Integrations & extras: ${INTEGRATIONS.length - missingInt.length}/${INTEGRATIONS.length} set, ${missingInt.length} pending`
);
if (missingInt.length) console.log("  Missing:", missingInt.join(", "));
console.log("");
console.log(
  "Note: Dollar/credit balance for OpenAI, Anthropic, etc. is not visible here — check each provider’s billing dashboard."
);
