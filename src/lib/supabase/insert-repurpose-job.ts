import type { SupabaseClient, User } from "@supabase/supabase-js";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import {
  ensureProfileReadyForSession,
  upsertProfileRowAdmin,
} from "@/lib/supabase/ensure-profile";

/** True when Postgres reports FK failure on repurpose_jobs → profiles(user_id). */
export function isLikelyUserProfileFkError(err: {
  message?: string;
  details?: string;
  hint?: string;
  code?: string;
} | null): boolean {
  if (!err) return false;
  const s = `${err.message ?? ""} ${err.details ?? ""} ${err.hint ?? ""}`.toLowerCase();
  if (s.includes("brand_voice") || s.includes("brand_voices")) return false;
  const code = String(err.code ?? "");
  if (code === "23503") {
    return true;
  }
  return (
    s.includes("user_id_fkey") ||
    s.includes("repurpose_jobs_user_id_fkey") ||
    (s.includes("user_id") && (s.includes("profiles") || s.includes("profile")))
  );
}

export type RepurposeJobInsertPayload = {
  user_id: string;
  input_type: string;
  input_content: string | null;
  input_url: string | null;
  brand_voice_id: string | null;
  output_language: string;
};

/** Insert a repurpose job as the server (service role). `user_id` must be the authenticated user from `getUser()`. */
export async function insertRepurposeJobAdmin(payload: RepurposeJobInsertPayload) {
  return getSupabaseAdmin()
    .from("repurpose_jobs")
    .insert(payload)
    .select("id")
    .single();
}

/**
 * Prefer service-role insert; if it fails (missing/wrong `SUPABASE_SERVICE_ROLE_KEY`, etc.), retry with the
 * user’s JWT — RLS allows insert when `user_id` matches `auth.uid()` (dashboard / landing repurpose).
 */
export async function insertRepurposeJobWithFallback(
  supabase: SupabaseClient,
  payload: RepurposeJobInsertPayload
) {
  let adminResult: Awaited<ReturnType<typeof insertRepurposeJobAdmin>>;
  try {
    adminResult = await insertRepurposeJobAdmin(payload);
  } catch (e) {
    console.warn("[repurpose_jobs] service-role insert threw; trying user session", e);
    const userResult = await supabase
      .from("repurpose_jobs")
      .insert(payload)
      .select("id")
      .single();
    if (!userResult.error && userResult.data) return userResult;
    throw e;
  }

  if (!adminResult.error && adminResult.data) return adminResult;

  const userResult = await supabase
    .from("repurpose_jobs")
    .insert(payload)
    .select("id")
    .single();

  if (!userResult.error && userResult.data) {
    console.warn(
      "[repurpose_jobs] service-role insert failed; user-session insert succeeded",
      adminResult.error?.message ?? adminResult.error
    );
    return userResult;
  }

  return adminResult;
}

/**
 * Inserts a repurpose job; on profile FK errors, upserts profile via admin + re-runs session ensure, then retries.
 */
export async function insertRepurposeJobWithProfileFixups(
  supabase: SupabaseClient,
  user: User,
  payload: RepurposeJobInsertPayload
) {
  let result = await insertRepurposeJobWithFallback(supabase, payload);
  for (let attempt = 0; attempt < 2 && result.error && isLikelyUserProfileFkError(result.error); attempt++) {
    await upsertProfileRowAdmin(user);
    try {
      await ensureProfileReadyForSession(user, supabase);
    } catch {
      /* ignore */
    }
    result = await insertRepurposeJobWithFallback(supabase, payload);
  }
  return result;
}
