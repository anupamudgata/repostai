#!/usr/bin/env node
/**
 * Prints SUPABASE_DB_PASSWORD from .env.local (stdout only, no trailing newline issues).
 * Used by supabase-db-push.sh when the var is not already exported.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.join(__dirname, "..", ".env.local");

try {
  const s = fs.readFileSync(envPath, "utf8");
  const m = s.match(/^SUPABASE_DB_PASSWORD=(.*)$/m);
  if (!m) process.exit(1);
  let v = m[1].trim();
  v = v.replace(/^["']|["']$/g, "");
  process.stdout.write(v);
} catch {
  process.exit(1);
}
