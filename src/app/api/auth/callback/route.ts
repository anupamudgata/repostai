import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

function getBaseUrl(request: NextRequest): string {
  const host = request.headers.get("x-forwarded-host");
  const proto = request.headers.get("x-forwarded-proto") ?? "https";
  if (host) return `${proto === "https" ? "https" : "http"}://${host}`;
  return request.nextUrl.origin;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";
  const baseUrl = getBaseUrl(request);

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      return NextResponse.redirect(`${baseUrl}${next}`);
    }
  }

  return NextResponse.redirect(`${baseUrl}/login?error=auth`);
}
