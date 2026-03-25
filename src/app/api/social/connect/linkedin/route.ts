import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { randomBytes } from "node:crypto";

export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (!user || !appUrl) {
    return NextResponse.redirect(new URL("/login", req.nextUrl.origin));
  }

  const clientId = process.env.LINKEDIN_CLIENT_ID;
  if (!clientId) {
    return NextResponse.redirect(new URL("/dashboard/settings?error=config", appUrl));
  }

  const statePayload = Buffer.from(
    JSON.stringify({ userId: user.id, platform: "linkedin", nonce: randomBytes(16).toString("hex") })
  ).toString("base64");

  const params = new URLSearchParams({
    response_type: "code",
    client_id: clientId,
    redirect_uri: `${appUrl}/api/social/callback/linkedin`,
    scope: "openid profile email w_member_social",
    state: statePayload,
  });

  const res = NextResponse.redirect(`https://www.linkedin.com/oauth/v2/authorization?${params}`);
  res.cookies.set("linkedin_social_state", statePayload, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: 600,
    path: "/",
  });
  return res;
}
