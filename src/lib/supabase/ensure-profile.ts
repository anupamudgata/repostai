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
  if (!insertErr) {
    // Verify the profile actually landed — some edge cases silently drop inserts
    const { data: verify } = await admin
      .from("profiles")
      .select("id")
      .eq("id", user.id)
      .maybeSingle();
    if (verify) return;
    console.warn("[ensureProfileForUser] insert reported success but profile not found — retrying");
    // Retry once with upsert
    const { error: upsertErr } = await admin
      .from("profiles")
      .upsert(row, { onConflict: "id" });
    if (!upsertErr) return;
    console.error("[ensureProfileForUser] upsert also failed", upsertErr);
  }

  if (insertErr?.code === "23505") {
    return;
  }

  const { data: race } = await admin
    .from("profiles")
    .select("id")
    .eq("id", user.id)
    .maybeSingle();
  if (race) return;

  if (userSupabase && (await hasProfile(userSupabase))) return;

  // Last resort: try user-session insert (works if INSERT RLS policy exists)
  if (userSupabase) {
    const { error: userInsertErr } = await userSupabase.from("profiles").upsert(row, { onConflict: "id" });
    if (!userInsertErr && (await hasProfile(userSupabase))) return;
    if (userInsertErr) {
      console.warn("[ensureProfileForUser] user-session upsert failed", userInsertErr.message);
    }

    // Final attempt: try RPC if available
    try {
      await userSupabase.rpc("ensure_profile_from_auth");
      if (await hasProfile(userSupabase)) return;
    } catch {
      // RPC might not exist yet
    }
  }

  console.error("[ensureProfileForUser] all attempts failed", insertErr);
  throw insertErr ?? new Error("Profile creation failed after all attempts");
}

/**
 * Use before inserts that FK to `profiles` (e.g. `repurpose_jobs`). Runs `ensureProfileForUser`,
 * verifies the row is visible to the session, retries `ensure_profile_from_auth` + full ensure once.
 */
export async function ensureProfileReadyForSession(
  user: User,
  userSupabase: SupabaseClient
): Promise<void> {
  await ensureProfileForUser(user, userSupabase);

  async function profileVisible(): Promise<boolean> {
    const { data } = await userSupabase
      .from("profiles")
      .select("id")
      .eq("id", user.id)
      .maybeSingle();
    return Boolean(data);
  }

  if (await profileVisible()) return;

  const { error: rpcErr } = await userSupabase.rpc("ensure_profile_from_auth");
  if (rpcErr) {
    console.warn("[ensureProfileReadyForSession] ensure_profile_from_auth", rpcErr.message);
  }
  if (await profileVisible()) return;

  await ensureProfileForUser(user, userSupabase);
  if (await profileVisible()) return;

  const { error: rpc2 } = await userSupabase.rpc("ensure_profile_from_auth");
  if (rpc2) {
    console.warn("[ensureProfileReadyForSession] ensure_profile_from_auth retry", rpc2.message);
  }
  if (await profileVisible()) return;

  throw new Error("Profile row still missing after ensure and RPC retries");
}
