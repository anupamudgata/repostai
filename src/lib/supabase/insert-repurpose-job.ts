import { getSupabaseAdmin } from "@/lib/supabase/admin";

/** True when Postgres reports FK failure on repurpose_jobs → profiles(user_id). */
export function isLikelyUserProfileFkError(err: {
  message?: string;
  details?: string;
} | null): boolean {
  if (!err) return false;
  const s = `${err.message ?? ""} ${err.details ?? ""}`.toLowerCase();
  if (s.includes("brand_voice")) return false;
  return (
    s.includes("user_id_fkey") ||
    s.includes("repurpose_jobs_user_id_fkey") ||
    (s.includes("user_id") &&
      (s.includes("profiles") || s.includes("profile")))
  );
}

/** Insert a repurpose job as the server (service role). `user_id` must be the authenticated user from `getUser()`. */
export async function insertRepurposeJobAdmin(payload: {
  user_id: string;
  input_type: string;
  input_content: string | null;
  input_url: string | null;
  brand_voice_id: string | null;
  output_language: string;
}) {
  return getSupabaseAdmin()
    .from("repurpose_jobs")
    .insert(payload)
    .select("id")
    .single();
}
