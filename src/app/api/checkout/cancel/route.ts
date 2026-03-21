import { NextRequest, NextResponse } from "next/server";

/** Optional cancel landing URL for hosted checkout flows; redirects to dashboard. */
export async function GET(request: NextRequest) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const returnTo = request.nextUrl.searchParams.get("return") || "/dashboard";
  const safePath = returnTo.startsWith("/") ? returnTo : "/dashboard";
  return NextResponse.redirect(`${baseUrl}${safePath}?checkout=cancelled`);
}
