import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { captureError } from "@/lib/sentry";
import { executeAccountDeletion } from "@/lib/account-deletion-execute";

const CONFIRM_PHRASE = "DELETE MY ACCOUNT";

/**
 * Signed-in immediate deletion (typed confirmation).
 * For GDPR email verification, prefer POST /api/user/delete/request then /complete.
 */
export async function DELETE(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }
    const body = await req.json().catch(() => ({}));
    if (body.confirm !== CONFIRM_PHRASE) {
      return NextResponse.json(
        { error: "Confirmation phrase required." },
        { status: 400 }
      );
    }

    const result = await executeAccountDeletion({
      userId: user.id,
      receiptEmail: user.email,
    });
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }
    return NextResponse.json(
      { success: true, message: "Account deleted successfully." },
      { status: 200 }
    );
  } catch (err) {
    captureError(err, { action: "delete_account" });
    return NextResponse.json(
      { error: "Unexpected error. Please contact support@repostai.com." },
      { status: 500 }
    );
  }
}
