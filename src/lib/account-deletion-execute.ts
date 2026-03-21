import { supabaseAdmin } from "@/lib/supabase/admin";
import { captureError, captureMessage } from "@/lib/sentry";
import { purgeUserAccountData } from "@/lib/account-deletion";
import { sendAccountDeletionCompleteEmail } from "@/lib/email/account-deletion-mail";

export type ExecuteAccountDeletionResult =
  | { ok: true }
  | { ok: false; status: number; error: string };

/**
 * Purges DB rows, notifies user by email, removes auth user.
 */
export async function executeAccountDeletion(params: {
  userId: string;
  receiptEmail: string | null | undefined;
}): Promise<ExecuteAccountDeletionResult> {
  const { userId, receiptEmail } = params;

  const purge = await purgeUserAccountData(supabaseAdmin, userId);
  if (!purge.ok) {
    return {
      ok: false,
      status: 500,
      error:
        purge.failedTable === "profiles"
          ? "Failed to delete account data. Please contact support@repostai.com."
          : `Could not remove all data (${purge.failedTable}). Please contact support@repostai.com.`,
    };
  }

  if (receiptEmail?.trim()) {
    const { sent, error } = await sendAccountDeletionCompleteEmail({
      to: receiptEmail.trim(),
    });
    if (!sent && error) {
      captureMessage("Account deletion: completion email not sent", "warning", {
        userId,
        extra: { error },
      });
    }
  }

  const { error: authDeleteError } = await supabaseAdmin.auth.admin.deleteUser(userId);
  if (authDeleteError) {
    captureError(authDeleteError, { userId, action: "delete_account_auth" });
    return {
      ok: false,
      status: 500,
      error:
        "Your data was removed but sign-in could not be fully cleared. Please contact support@repostai.com.",
    };
  }

  captureMessage("Account deleted successfully", "info", { userId });
  return { ok: true };
}
