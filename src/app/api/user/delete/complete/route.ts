import { NextRequest, NextResponse } from "next/server";
import { captureError } from "@/lib/sentry";
import { verifyAccountDeletionToken } from "@/lib/account-deletion-token";
import { executeAccountDeletion } from "@/lib/account-deletion-execute";

const CONFIRM_PHRASE = "DELETE MY ACCOUNT";

/**
 * Completes deletion using signed token from email + confirmation phrase (no session required).
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const token = typeof body.token === "string" ? body.token : "";
    const confirm = typeof body.confirm === "string" ? body.confirm : "";

    if (confirm !== CONFIRM_PHRASE) {
      return NextResponse.json(
        { error: "Confirmation phrase required." },
        { status: 400 }
      );
    }
    if (!token.trim()) {
      return NextResponse.json({ error: "Invalid or missing token." }, { status: 400 });
    }

    const verified = verifyAccountDeletionToken(token.trim());
    if (!verified) {
      return NextResponse.json(
        { error: "This link is invalid or has expired. Request a new deletion email from Settings." },
        { status: 400 }
      );
    }

    const result = await executeAccountDeletion({
      userId: verified.userId,
      receiptEmail: verified.email,
    });
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }
    return NextResponse.json(
      { success: true, message: "Account deleted successfully." },
      { status: 200 }
    );
  } catch (err) {
    captureError(err, { action: "delete_account_complete" });
    return NextResponse.json(
      { error: "Unexpected error. Please contact support@repostai.com." },
      { status: 500 }
    );
  }
}
