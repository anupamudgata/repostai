import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { captureError } from "@/lib/sentry";
import { signAccountDeletionToken } from "@/lib/account-deletion-token";
import { sendAccountDeletionLinkEmail } from "@/lib/email/account-deletion-mail";

/**
 * Sends a signed, time-limited link to complete account deletion (email verification).
 */
export async function POST() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user?.email) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    let token: string;
    try {
      token = signAccountDeletionToken(user.id, user.email);
    } catch (e) {
      captureError(e, { action: "delete_account_token_sign" });
      return NextResponse.json(
        { error: "Account deletion is not configured. Contact support." },
        { status: 500 }
      );
    }

    const { sent, error } = await sendAccountDeletionLinkEmail({
      to: user.email,
      token,
    });
    if (!sent) {
      return NextResponse.json(
        {
          error:
            error === "Email not configured"
              ? "Email could not be sent (server configuration). Use “Delete now” while signed in or contact support."
              : "Could not send email. Try again or contact support.",
        },
        { status: 503 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Check your email for a link to confirm deletion.",
    });
  } catch (err) {
    captureError(err, { action: "delete_account_request" });
    return NextResponse.json({ error: "Unexpected error." }, { status: 500 });
  }
}
