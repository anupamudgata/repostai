// src/lib/supabase/admin.ts
// FIXED: Lazy initialization — never throws at build time

import { createClient, SupabaseClient } from "@supabase/supabase-js";

let _client: SupabaseClient | null = null;

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
      console.error(
        "[supabase admin] SUPABASE_SERVICE_ROLE_KEY matches the anon key — profile creation and server writes will fail RLS. Set the service_role key from Supabase → Settings → API."
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
