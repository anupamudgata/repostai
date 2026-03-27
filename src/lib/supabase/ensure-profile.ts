import type { User } from "@supabase/supabase-js";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

/**
 * `brand_voices`, `repurpose_jobs`, etc. reference `profiles(id)`. Users created before
 * `handle_new_user` existed (or if the trigger failed) have no profile row — inserts then
 * fail with brand_voices_user_id_fkey. This heals that gap idempotently.
 */
export async function ensureProfileForUser(user: User): Promise<void> {
  const admin = getSupabaseAdmin();
  const { data: existing } = await admin
    .from("profiles")
    .select("id")
    .eq("id", user.id)
    .maybeSingle();
  if (existing) return;

  const meta = user.user_metadata ?? {};
  const { error } = await admin.from("profiles").insert({
    id: user.id,
    email: user.email ?? "",
    name: (meta.full_name as string) ?? (meta.name as string) ?? null,
    avatar_url: (meta.avatar_url as string) ?? null,
    market_region: (meta.market_region as string) ?? null,
  });

  if (error) {
    // Race: another request inserted the profile first
    if (error.code === "23505") return;
    console.error("[ensureProfileForUser]", error);
    throw error;
  }
}
