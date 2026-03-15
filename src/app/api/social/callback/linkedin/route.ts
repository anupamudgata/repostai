// src/app/api/social/callback/linkedin/route.ts
import { NextRequest, NextResponse } from "next/server";
import { upsertToken }               from "@/lib/social/token-store";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code  = searchParams.get("code");
  const state = searchParams.get("state");
  const appUrl = process.env.NEXT_PUBLIC_APP_URL!;
  if (!code || !state) return NextResponse.redirect(`${appUrl}/dashboard/settings?error=linkedin_denied`);
  const { userId } = JSON.parse(Buffer.from(state, "base64").toString("utf-8"));
  const tokenRes = await fetch("https://www.linkedin.com/oauth/v2/accessToken", {
    method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ grant_type: "authorization_code", code, client_id: process.env.LINKEDIN_CLIENT_ID!, client_secret: process.env.LINKEDIN_CLIENT_SECRET!, redirect_uri: `${appUrl}/api/social/callback/linkedin` }),
  });
  const tokenData = await tokenRes.json();
  if (!tokenData.access_token) return NextResponse.redirect(`${appUrl}/dashboard/settings?error=linkedin_token`);
  const profileRes = await fetch("https://api.linkedin.com/v2/userinfo", { headers: { Authorization: `Bearer ${tokenData.access_token}` } });
  const profile = await profileRes.json();
  await upsertToken(userId, "linkedin", {
    accessToken: tokenData.access_token, refreshToken: tokenData.refresh_token, expiresInSeconds: tokenData.expires_in,
    platformUserId: profile.sub, platformUsername: profile.name, platformAvatar: profile.picture, scope: tokenData.scope,
  });
  return NextResponse.redirect(`${appUrl}/dashboard/settings?connected=linkedin`);
}
