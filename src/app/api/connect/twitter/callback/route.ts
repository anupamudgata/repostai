import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { encrypt } from "@/lib/crypto/tokens";
import { APP_URL } from "@/config/constants";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const errorParam = searchParams.get("error");

  if (errorParam) {
    return NextResponse.redirect(
      new URL(`/dashboard/connections?error=${errorParam}`, APP_URL)
    );
  }

  const cookieState = request.cookies.get("twitter_oauth_state")?.value;
  const codeVerifier = request.cookies.get("twitter_oauth_verifier")?.value;

  if (!code || !state || state !== cookieState || !codeVerifier) {
    return NextResponse.redirect(
      new URL("/dashboard/connections?error=invalid_callback", APP_URL)
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.redirect(new URL("/login", APP_URL));
  }

  const clientId = process.env.TWITTER_CLIENT_ID;
  const clientSecret = process.env.TWITTER_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    return NextResponse.redirect(
      new URL("/dashboard/connections?error=config", APP_URL)
    );
  }

  const redirectUri = `${APP_URL}/api/connect/twitter/callback`;
  const tokenUrl = "https://api.x.com/2/oauth2/token";
  const body = new URLSearchParams({
    code,
    grant_type: "authorization_code",
    redirect_uri: redirectUri,
    code_verifier: codeVerifier,
  });

  const tokenRes = await fetch(tokenUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
    },
    body: body.toString(),
  });

  if (!tokenRes.ok) {
    const err = await tokenRes.text();
    console.error("Twitter token exchange failed:", err);
    return NextResponse.redirect(
      new URL("/dashboard/connections?error=token", APP_URL)
    );
  }

  const tokenData = (await tokenRes.json()) as {
    access_token: string;
    refresh_token?: string;
    expires_in?: number;
  };

  let username: string | null = null;
  let platformUserId: string | null = null;
  try {
    const meRes = await fetch("https://api.x.com/2/users/me", {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
      },
    });
    if (meRes.ok) {
      const me = (await meRes.json()) as { data?: { id?: string; username?: string } };
      username = me.data?.username ?? null;
      platformUserId = me.data?.id ?? null;
    }
  } catch {
    // non-fatal
  }

  const expiresAt = tokenData.expires_in
    ? new Date(Date.now() + tokenData.expires_in * 1000).toISOString()
    : null;

  try {
    await supabase.from("connected_accounts").upsert(
      {
        user_id: user.id,
        platform: "twitter",
        access_token: encrypt(tokenData.access_token),
        refresh_token: tokenData.refresh_token
          ? encrypt(tokenData.refresh_token)
          : null,
        platform_username: username,
        platform_user_id: platformUserId ?? "unknown",
        token_expires_at: expiresAt,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id,platform" }
    );
  } catch (e) {
    console.error("Save connected account failed:", e);
    return NextResponse.redirect(
      new URL("/dashboard/connections?error=save", APP_URL)
    );
  }

  const res = NextResponse.redirect(new URL("/dashboard/connections", APP_URL));
  res.cookies.delete("twitter_oauth_state");
  res.cookies.delete("twitter_oauth_verifier");
  return res;
}
