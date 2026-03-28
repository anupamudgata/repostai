import { NextResponse } from "next/server";
import { APP_URL } from "@/config/constants";

/**
 * This callback is deprecated. The canonical LinkedIn OAuth flow uses
 * /api/social/connect/linkedin → /api/social/callback/linkedin.
 *
 * Redirect to connections page with an error if someone ends up here.
 */
export async function GET() {
  return NextResponse.redirect(
    new URL("/dashboard/connections?error=invalid_callback", APP_URL)
  );
}
