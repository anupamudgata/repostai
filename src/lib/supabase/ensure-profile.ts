import type { SupabaseClient, User } from "@supabase/supabase-js";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

/** True if a profiles row exists (service role — bypasses RLS). */
export async function profileRowExistsAdmin(userId: string): Promise<boolean> {
  try {
    const admin = getSupabaseAdmin();
    const { data, error } = await admin
      .from("profiles")
      .select("id")
      .eq("id", userId)
      .maybeSingle();
    if (error) {
      console.warn("[profileRowExistsAdmin]", error.message, error.code);
      return false;
    }
    return Boolean(data);
  } catch {
    return false;
  }
}

/** Non-sensitive config errors to surface in API responses (wrong Supabase keys). */
export function profileEnsureConfigErrorMessage(err: unknown): string | null {
  if (!(err instanceof Error)) return null;
  if (/service_role|SUPABASE_SERVICE_ROLE_KEY|anon key/i.test(err.message)) {
    return err.message;
  }
  return null;
}

/** Read zapier_webhook_url when JWT cannot SELECT profiles (RLS) but row exists. */
export async function getProfileZapierAdmin(
  userId: string
): Promise<string | null> {
  try {
    const admin = getSupabaseAdmin();
    const { data, error } = await admin
      .from("profiles")
      .select("zapier_webhook_url")
      .eq("id", userId)
      .maybeSingle();
    if (error || !data) return null;
    return data.zapier_webhook_url ?? null;
  } catch {
    return null;
  }
}

/**
 * `/api/me` needs a `profiles` row for Zapier settings. User JWT first; if RLS hides
 * the row (common misconfiguration), read with service role so the dashboard does not
 * show PROFILE_SYNC_FAILED while subscriptions still resolve as paid.
 */
export async function getProfileZapierForSession(
  userId: string,
  userSupabase: SupabaseClient
): Promise<{ zapier_webhook_url: string | null } | null> {
  const { data, error } = await userSupabase
    .from("profiles")
    .select("zapier_webhook_url")
    .eq("id", userId)
    .maybeSingle();
  if (!error && data) {
    return { zapier_webhook_url: data.zapier_webhook_url ?? null };
  }
  if (error) {
    console.warn(
      "[getProfileZapierForSession] user JWT select failed",
      userId,
      error.code,
      error.message
    );
  }
  try {
    const admin = getSupabaseAdmin();
    const { data: ad, error: adErr } = await admin
      .from("profiles")
      .select("zapier_webhook_url")
      .eq("id", userId)
      .maybeSingle();
    if (adErr) {
      console.warn(
        "[getProfileZapierForSession] admin select failed",
        userId,
        adErr.code,
        adErr.message
      );
      return null;
    }
    if (ad) {
      console.warn(
        "[getProfileZapierForSession] using service-role read (fix SELECT RLS on public.profiles — scripts/supabase-paste-full-profile-fix.sql)",
        { userId }
      );
      return { zapier_webhook_url: ad.zapier_webhook_url ?? null };
    }
  } catch (e) {
    console.warn("[getProfileZapierForSession] admin client unavailable", e);
  }
  return null;
}

/** Update Zapier webhook when JWT UPDATE on profiles fails (RLS). */
export async function updateProfileZapierUrlAdmin(
  userId: string,
  zapier_webhook_url: string | null
): Promise<{ ok: boolean; error?: string }> {
  try {
    const admin = getSupabaseAdmin();
    const { error } = await admin
      .from("profiles")
      .update({ zapier_webhook_url })
      .eq("id", userId);
    if (error) {
      return { ok: false, error: error.message };
    }
    return { ok: true };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return { ok: false, error: msg };
  }
}

/** Name/avatar for dashboard shell when JWT cannot SELECT `profiles` but row exists (service role). */
export async function getProfileDisplayFromAdmin(
  userId: string
): Promise<{ name: string | null; avatar_url: string | null } | null> {
  try {
    const admin = getSupabaseAdmin();
    const { data, error } = await admin
      .from("profiles")
      .select("name, avatar_url")
      .eq("id", userId)
      .maybeSingle();
    if (error || !data) return null;
    return {
      name: data.name ?? null,
      avatar_url: data.avatar_url ?? null,
    };
  } catch {
    return null;
  }
}

export type GetOrCreateUserProfileResult =
  | { ok: true; zapier_webhook_url: string | null }
  | { ok: false; kind: "config"; message: string }
  | { ok: false; kind: "missing"; message: string };

/**
 * Idempotent profile bootstrap + read for `/api/me`, dashboard layout, and auth callback.
 * Ensures FK targets exist and returns Zapier field using JWT or service-role read (RLS-safe).
 */
export async function getOrCreateUserProfile(
  user: User,
  userSupabase: SupabaseClient
): Promise<GetOrCreateUserProfileResult> {
  try {
    await ensureProfileForRepurposeInsert(user, userSupabase);
  } catch (e) {
    const cfg = profileEnsureConfigErrorMessage(e);
    if (cfg) {
      return { ok: false, kind: "config", message: cfg };
    }
    console.warn(
      "[getOrCreateUserProfile] ensureProfileForRepurposeInsert threw (continuing)",
      e instanceof Error ? e.message : e
    );
  }

  for (let attempt = 0; attempt < 3; attempt++) {
    const row = await getProfileZapierForSession(user.id, userSupabase);
    if (row) {
      return { ok: true, zapier_webhook_url: row.zapier_webhook_url };
    }
    console.warn("[getOrCreateUserProfile] profile unreadable", {
      userId: user.id,
      attempt,
    });
    try {
      await ensureProfileForRepurposeInsert(user, userSupabase);
    } catch (e2) {
      const cfg2 = profileEnsureConfigErrorMessage(e2);
      if (cfg2) {
        return { ok: false, kind: "config", message: cfg2 };
      }
    }
  }

  await bootstrapProfileFromAuthAdmin(user.id);
  try {
    await userSupabase.rpc("ensure_profile_from_auth");
  } catch {
    /* RPC optional */
  }

  let row = await getProfileZapierForSession(user.id, userSupabase);
  if (row) {
    return { ok: true, zapier_webhook_url: row.zapier_webhook_url };
  }

  try {
    await ensureProfileForRepurposeInsert(user, userSupabase);
  } catch (e3) {
    const cfg3 = profileEnsureConfigErrorMessage(e3);
    if (cfg3) {
      return { ok: false, kind: "config", message: cfg3 };
    }
  }

  row = await getProfileZapierForSession(user.id, userSupabase);
  if (row) {
    return { ok: true, zapier_webhook_url: row.zapier_webhook_url };
  }

  console.error("[getOrCreateUserProfile] exhausted retries", {
    userId: user.id,
  });
  return {
    ok: false,
    kind: "missing",
    message:
      "Profile could not be created or read. Set SUPABASE_SERVICE_ROLE_KEY (same project as NEXT_PUBLIC_SUPABASE_URL) and run scripts/supabase-paste-full-profile-fix.sql.",
  };
}

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
    if (e instanceof Error && /service_role|SUPABASE_SERVICE_ROLE_KEY|anon key/i.test(e.message)) {
      throw e;
    }
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

  // Row may exist (FK OK) but session still not seeing it — force service-role upsert, then RPC again.
  await upsertProfileRowAdmin(user);
  if (await profileVisible()) return;

  const { error: rpc3 } = await userSupabase.rpc("ensure_profile_from_auth");
  if (rpc3) {
    console.warn("[ensureProfileReadyForSession] ensure_profile_from_auth after admin upsert", rpc3.message);
  }
  if (await profileVisible()) return;

  // Row exists in DB (FK OK) but session still cannot read it — broken RLS or stale JWT.
  // Do not block repurpose: job insert uses service role and only needs the FK target.
  if (await profileRowExistsAdmin(user.id)) {
    console.warn(
      "[ensureProfileReadyForSession] profiles row exists for user but JWT session cannot select it — check RLS SELECT on public.profiles and run scripts/supabase-paste-full-profile-fix.sql"
    );
    return;
  }

  // Last resort: read auth.users via Admin API and upsert profiles (works when SQL trigger/RPC never ran).
  const bootstrapped = await bootstrapProfileFromAuthAdmin(user.id);
  if (bootstrapped) {
    if (await profileVisible()) return;
    if (await profileRowExistsAdmin(user.id)) return;
  }

  throw new Error("Profile row still missing after ensure and RPC retries");
}

/**
 * Creates `public.profiles` from `auth.users` using the service role + Auth Admin API.
 * Use when trigger/RPC/`ensure_profile_from_auth` did not run (common for older accounts or partial migrations).
 */
export async function bootstrapProfileFromAuthAdmin(userId: string): Promise<boolean> {
  if (await profileRowExistsAdmin(userId)) return true;
  try {
    const admin = getSupabaseAdmin();
    const { data, error } = await admin.auth.admin.getUserById(userId);
    if (error || !data?.user) {
      console.warn("[bootstrapProfileFromAuthAdmin] getUserById", error?.message);
      return false;
    }
    const u = data.user;
    const meta = u.user_metadata ?? {};
    const emailRaw = u.email?.trim() ?? "";
    const row = {
      id: u.id,
      email: emailRaw || `${u.id.replace(/-/g, "")}@users.repostai.local`,
      name: (meta.full_name as string) ?? (meta.name as string) ?? null,
      avatar_url: (meta.avatar_url as string) ?? null,
      market_region: (meta.market_region as string) ?? null,
    };
    const { error: upErr } = await admin
      .from("profiles")
      .upsert(row, { onConflict: "id" });
    if (upErr) {
      console.warn(
        "[bootstrapProfileFromAuthAdmin] upsert",
        upErr.message,
        upErr.code
      );
    }
    return await profileRowExistsAdmin(userId);
  } catch (e) {
    console.warn("[bootstrapProfileFromAuthAdmin]", e);
    return false;
  }
}

/** Force a `profiles` row via service role so FK checks on `repurpose_jobs` succeed (same DB the admin client uses). */
export async function upsertProfileRowAdmin(user: User): Promise<void> {
  let admin: ReturnType<typeof getSupabaseAdmin>;
  try {
    admin = getSupabaseAdmin();
  } catch {
    return;
  }
  const meta = user.user_metadata ?? {};
  const emailRaw = user.email?.trim() ?? "";
  const row = {
    id: user.id,
    email: emailRaw || `${user.id.replace(/-/g, "")}@users.repostai.local`,
    name: (meta.full_name as string) ?? (meta.name as string) ?? null,
    avatar_url: (meta.avatar_url as string) ?? null,
    market_region: (meta.market_region as string) ?? null,
  };
  const { error } = await admin.from("profiles").upsert(row, { onConflict: "id" });
  if (error) {
    console.warn("[upsertProfileRowAdmin]", error.message, error.code);
  }
}

/** Session-visible profile + admin upsert before any insert that FK-references `profiles`. */
export async function ensureProfileForRepurposeInsert(
  user: User,
  userSupabase: SupabaseClient
): Promise<void> {
  // Create row with service role first when possible so FK + /api/me succeed even if JWT path lags.
  await upsertProfileRowAdmin(user);
  await ensureProfileReadyForSession(user, userSupabase);
  await upsertProfileRowAdmin(user);
}
