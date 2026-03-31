#!/usr/bin/env node
/**
 * Set (or create) an auth user password for local testing.
 * Requires SUPABASE_SERVICE_ROLE_KEY + NEXT_PUBLIC_SUPABASE_URL in .env.local
 *
 * Usage:
 *   node scripts/set-auth-user-password.mjs <email> <password>
 *   npm run auth:set-password -- aireposai@gmail.com '143@Anup'
 *
 * If the user does not exist, creates them with email_confirm true (can log in immediately).
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");
const envPath = resolve(root, ".env.local");

function loadEnv(path) {
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

const [emailRaw, password] = process.argv.slice(2);
if (!emailRaw || !password) {
  console.error(
    "Usage: node scripts/set-auth-user-password.mjs <email> <password>\n" +
      "Example: npm run auth:set-password -- aireposai@gmail.com '143@Anup'"
  );
  process.exit(1);
}

const email = emailRaw.trim().toLowerCase();
const fileEnv = loadEnv(envPath);
const url = fileEnv.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey =
  fileEnv.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY (.env.local or env)."
  );
  process.exit(1);
}

const admin = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

let userId = null;
for (let page = 1; page <= 20; page++) {
  const { data, error } = await admin.auth.admin.listUsers({
    page,
    perPage: 200,
  });
  if (error) {
    console.error("listUsers failed:", error.message);
    process.exit(1);
  }
  const users = data?.users ?? [];
  const hit = users.find((u) => (u.email || "").toLowerCase() === email);
  if (hit) {
    userId = hit.id;
    break;
  }
  if (users.length < 200) break;
}

if (userId) {
  const { error } = await admin.auth.admin.updateUserById(userId, {
    password,
  });
  if (error) {
    console.error("updateUserById failed:", error.message);
    process.exit(1);
  }
  console.log("Password updated for:", email, "(id:", userId + ")");
} else {
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
  if (error) {
    console.error("createUser failed:", error.message);
    process.exit(1);
  }
  console.log("Created user with password:", email, "(id:", data.user.id + ")");
}
