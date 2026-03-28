import { NextResponse } from "next/server";
import { APP_URL } from "@/config/constants";

/**
 * Redirect to the canonical LinkedIn OAuth route.
 * This path is deprecated — use /api/social/connect/linkedin instead.
 */
export async function GET() {
  return NextResponse.redirect(new URL("/api/social/connect/linkedin", APP_URL));
}
