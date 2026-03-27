import type { SupabaseClient, User } from "@supabase/supabase-js";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

/**
 * `brand_voices`, `repurpose_jobs`, etc. reference `profiles(id)`. Ensures a row exists.
 *
 * 1) When `userSupabase` is passed (server client with the user's session), calls
 *    `ensure_profile_from_auth` (DB migration) so profile creation works even if
 *    `SUPABASE_SERVICE_ROLE_KEY` is missing or misconfigured in an environment.
 * 2) Falls back to service-role insert when needed.
 */
export async function ensureProfileForUser(
  user: User,
  userSupabase?: SupabaseClient
): Promise<void> {
  const meta = user.user_metadata ?? {};
  const emailRaw = user.email?.trim() ?? "";
  const row = {
    id: user.id,
    email: emailRaw || `${user.id.replace(/-/g, "")}@users.repostai.local`,
    name: (meta.full_name as string) ?? (meta.name as string) ?? null,
    avatar_url: (meta.avatar_url as string) ?? null,
    market_region: (meta.market_region as string) ?? null,
  };

  async function hasProfile(client: SupabaseClient): Promise<boolean> {
    const { data } = await client
      .from("profiles")
      .select("id")
      .eq("id", user.id)
      .maybeSingle();
    return Boolean(data);
  }

  if (userSupabase) {
    if (await hasProfile(userSupabase)) return;

    const { error: rpcErr } = await userSupabase.rpc("ensure_profile_from_auth");
    if (!rpcErr && (await hasProfile(userSupabase))) return;
    if (rpcErr) {
      console.warn("[ensureProfileForUser] ensure_profile_from_auth", rpcErr.message);
    }
  }

  let admin: ReturnType<typeof getSupabaseAdmin>;
  try {
    admin = getSupabaseAdmin();
  } catch (e) {
    console.error("[ensureProfileForUser] service role unavailable", e);
    if (userSupabase && (await hasProfile(userSupabase))) return;
    throw new Error(
      "Could not create your profile. Apply the latest Supabase migration (ensure_profile_from_auth) and set SUPABASE_SERVICE_ROLE_KEY."
    );
  }

  const { data: existing } = await admin
    .from("profiles")
    .select("id")
    .eq("id", user.id)
    .maybeSingle();

  if (existing) return;

  const { error: insertErr } = await admin.from("profiles").insert(row);
  if (!insertErr) return;

  if (insertErr.code === "23505") {
    return;
  }

  const { data: race } = await admin
    .from("profiles")
    .select("id")
    .eq("id", user.id)
    .maybeSingle();
  if (race) return;

  if (userSupabase && (await hasProfile(userSupabase))) return;

  console.error("[ensureProfileForUser] insert failed", insertErr);
  throw insertErr;
}
