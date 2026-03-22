import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { APP_URL } from "@/config/constants";

const SCOPES = [
  "pages_show_list",
  "pages_read_engagement",
  "instagram_basic",
  "instagram_content_publish",
  "business_management",
].join(",");

export async function GET(_req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.redirect(new URL("/login", APP_URL));
  }

  const appId = process.env.FACEBOOK_APP_ID?.trim() || process.env.META_APP_ID?.trim();
  if (!appId) {
    return NextResponse.redirect(
      new URL("/dashboard/connections?error=meta_config", APP_URL)
    );
  }

  const state = Buffer.from(
    JSON.stringify({ userId: user.id, t: Date.now() }),
    "utf-8"
  ).toString("base64url");

  const redirectUri = `${APP_URL.replace(/\/$/, "")}/api/social/callback/instagram`;

  const authUrl = new URL(`https://www.facebook.com/v21.0/dialog/oauth`);
  authUrl.searchParams.set("client_id", appId);
  authUrl.searchParams.set("redirect_uri", redirectUri);
  authUrl.searchParams.set("scope", SCOPES);
  authUrl.searchParams.set("response_type", "code");
  authUrl.searchParams.set("state", state);

  const res = NextResponse.redirect(authUrl.toString());
  res.cookies.set("instagram_oauth_state", state, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 600,
  });
  return res;
}
