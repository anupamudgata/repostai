import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { upsertToken } from "@/lib/social/token-store";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const appUrl = process.env.NEXT_PUBLIC_APP_URL!;

  if (!code || !state) {
    return NextResponse.redirect(`${appUrl}/dashboard/connections?error=linkedin_denied`);
  }

  const cookieState = req.cookies.get("linkedin_social_state")?.value;
  if (!cookieState || state !== cookieState) {
    return NextResponse.redirect(`${appUrl}/dashboard/connections?error=invalid_state`);
  }

  let userId: string;
  try {
    ({ userId } = JSON.parse(Buffer.from(state, "base64").toString("utf-8")));
  } catch {
    return NextResponse.redirect(`${appUrl}/dashboard/connections?error=invalid_state`);
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.id !== userId) {
    return NextResponse.redirect(`${appUrl}/dashboard/connections?error=unauthorized`);
  }

  try {
    const tokenRes = await fetch("https://www.linkedin.com/oauth/v2/accessToken", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        client_id: process.env.LINKEDIN_CLIENT_ID!,
        client_secret: process.env.LINKEDIN_CLIENT_SECRET!,
        redirect_uri: `${appUrl}/api/social/callback/linkedin`,
      }),
    });
    const tokenData = await tokenRes.json();
    if (!tokenData.access_token) {
      return NextResponse.redirect(`${appUrl}/dashboard/connections?error=linkedin_token`);
    }

    const profileRes = await fetch("https://api.linkedin.com/v2/userinfo", {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });
    const profile = await profileRes.json();

    await upsertToken(userId, "linkedin", {
      accessToken: tokenData.access_token,
      refreshToken: tokenData.refresh_token,
      expiresInSeconds: tokenData.expires_in,
      platformUserId: profile.sub,
      platformUsername: profile.name,
      platformAvatar: profile.picture,
      scope: tokenData.scope,
    });

    const res = NextResponse.redirect(`${appUrl}/dashboard/connections?connected=linkedin`);
    res.cookies.delete("linkedin_social_state");
    return res;
  } catch (err) {
    console.error("[social/callback/linkedin] Error:", err);
    return NextResponse.redirect(`${appUrl}/dashboard/connections?error=linkedin_error`);
  }
}
