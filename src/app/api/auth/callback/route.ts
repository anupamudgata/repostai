import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { APP_URL } from "@/config/constants";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      const baseUrl =
        APP_URL ||
        (request.headers.get("x-forwarded-host")
          ? `https://${request.headers.get("x-forwarded-host")}`
          : request.nextUrl.origin);
      return NextResponse.redirect(`${baseUrl}${next}`);
    }
  }

  return NextResponse.redirect(`${APP_URL || request.nextUrl.origin}/login?error=auth`);
}
