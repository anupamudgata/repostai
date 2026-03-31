// src/lib/supabase/admin.ts
// FIXED: Lazy initialization — never throws at build time

import { createClient, SupabaseClient } from "@supabase/supabase-js";

let _client: SupabaseClient | null = null;

/** Supabase API keys are JWTs; `role` must be `service_role` for RLS bypass. */
function jwtRoleFromKey(key: string): string | null {
  const parts = key.trim().split(".");
  if (parts.length < 2) return null;
  try {
    const payload = JSON.parse(
      Buffer.from(parts[1], "base64url").toString("utf8")
    ) as { role?: string };
    return payload.role ?? null;
  } catch {
    return null;
  }
}

// ── Lazy singleton ────────────────────────────────────────────────────────────
// Same reason as stripe/config.ts — top-level throws crash the entire build
// including pages that never touch Supabase (like your landing page).

export function getSupabaseAdmin(): SupabaseClient {
  if (!_client) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!url) throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL");
    if (!key) throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY");
    if (anon && key.trim() === anon.trim()) {
      throw new Error(
        "SUPABASE_SERVICE_ROLE_KEY must not equal the anon key. In Supabase → Settings → API, copy the secret labeled service_role (not anon)."
      );
    }
    const role = jwtRoleFromKey(key);
    if (role && role !== "service_role") {
      throw new Error(
        `SUPABASE_SERVICE_ROLE_KEY is not the service_role JWT (decoded role: "${role}"). Use the service_role secret from Supabase → Settings → API.`
      );
    }

    _client = createClient(url, key, {
      auth: {
        autoRefreshToken: false,
        persistSession:   false,
      },
    });
  }
  return _client;
}

// Proxy so all existing code using `supabaseAdmin.from(...)` still works
export const supabaseAdmin = new Proxy({} as SupabaseClient, {
  get(_target, prop: string) {
    return getSupabaseAdmin()[prop as keyof SupabaseClient];
  },
});
