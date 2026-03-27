import type { User } from "@supabase/supabase-js";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

/**
 * `brand_voices`, `repurpose_jobs`, etc. reference `profiles(id)`. Users created before
 * `handle_new_user` existed (or if the trigger failed) have no profile row — inserts then
 * fail with repurpose_jobs_user_id_fkey. Idempotent upsert so the row always exists.
 *
 * Uses `ignoreDuplicates` so an existing row (and `plan`) is never overwritten.
 */
export async function ensureProfileForUser(user: User): Promise<void> {
  const admin = getSupabaseAdmin();
  const meta = user.user_metadata ?? {};
  const row = {
    id: user.id,
    email: user.email?.trim() ?? "",
    name: (meta.full_name as string) ?? (meta.name as string) ?? null,
    avatar_url: (meta.avatar_url as string) ?? null,
    market_region: (meta.market_region as string) ?? null,
  };

  const { error } = await admin.from("profiles").upsert(row, {
    onConflict: "id",
    ignoreDuplicates: true,
  });

  if (error) {
    console.error("[ensureProfileForUser]", error);
    throw error;
  }
}
