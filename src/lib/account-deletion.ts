/**
 * GDPR / right-to-erasure: ordered deletes respecting FKs.
 * post_engagement → scheduled_posts → … → profiles (auth user deleted separately).
 *
 * Manual cascade QA (Supabase SQL): after deleting a test user id, expect zero rows:
 *   select 'post_engagement' t, count(*) from post_engagement where user_id = $id
 *   union all select 'scheduled_posts', count(*) from scheduled_posts where user_id = $id
 *   ... repeat for each table in ACCOUNT_DELETION_TABLES; auth.users via dashboard.
 */
import type { SupabaseClient } from "@supabase/supabase-js";
import { captureError } from "@/lib/sentry";

/** Tables and column used to scope rows to a user. Order matters for foreign keys. */
export const ACCOUNT_DELETION_TABLES: readonly { table: string; column: "user_id" | "id" }[] = [
  { table: "post_engagement", column: "user_id" },
  { table: "scheduled_posts", column: "user_id" },
  { table: "created_posts", column: "user_id" },
  { table: "connected_accounts", column: "user_id" },
  { table: "repurpose_jobs", column: "user_id" },
  { table: "usage", column: "user_id" },
  { table: "brand_voices", column: "user_id" },
  { table: "subscriptions", column: "user_id" },
  { table: "profiles", column: "id" },
] as const;

export type PurgeAccountResult = {
  ok: boolean;
  failedTable?: string;
  errorMessage?: string;
};

/**
 * Deletes all application data for a user. Caller must delete auth.users after success.
 */
export async function purgeUserAccountData(
  admin: SupabaseClient,
  userId: string
): Promise<PurgeAccountResult> {
  for (const { table, column } of ACCOUNT_DELETION_TABLES) {
    const { error } = await admin.from(table).delete().eq(column, userId);
    if (error) {
      captureError(error, { userId, action: "purge_account_table", extra: { table } });
      return {
        ok: false,
        failedTable: table,
        errorMessage: error.message,
      };
    }
  }
  return { ok: true };
}
