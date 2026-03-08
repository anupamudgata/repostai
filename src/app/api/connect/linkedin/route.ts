import { NextResponse } from "next/server";
import { APP_URL } from "@/config/constants";

/** LinkedIn OAuth not yet implemented. Redirects to connections with message. */
export async function GET() {
  return NextResponse.redirect(
    new URL("/dashboard/connections?info=linkedin_coming_soon", APP_URL)
  );
}
