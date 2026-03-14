import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { encrypt } from "@/lib/crypto/tokens";
import { APP_URL } from "@/config/constants";

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const searchParams = url.searchParams;
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const errorParam = searchParams.get("error");

  if (errorParam) {
    return NextResponse.redirect(
      new URL("/dashboard/connections?error=token", APP_URL)
    );
  }

  const cookieState = request.cookies.get("linkedin_oauth_state")?.value;

  if (!code || !state || state !== cookieState) {
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

  const clientId = process.env.LINKEDIN_CLIENT_ID;
  const clientSecret = process.env.LINKEDIN_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return NextResponse.redirect(
      new URL("/dashboard/connections?error=config", APP_URL)
    );
  }

  const redirectUri = `${APP_URL}/api/connect/linkedin/callback`;
  const tokenUrl = "https://www.linkedin.com/oauth/v2/accessToken";
  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    redirect_uri: redirectUri,
    client_id: clientId,
    client_secret: clientSecret,
  });

  const tokenRes = await fetch(tokenUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: body.toString(),
  });

  if (!tokenRes.ok) {
    const err = await tokenRes.text();
    console.error("LinkedIn token exchange failed:", err);
    return NextResponse.redirect(
      new URL("/dashboard/connections?error=token", APP_URL)
    );
  }

  const tokenData = (await tokenRes.json()) as {
    access_token: string;
    expires_in?: number;
    refresh_token?: string;
    refresh_token_expires_in?: number;
  };

  if (!tokenData.access_token) {
    return NextResponse.redirect(
      new URL("/dashboard/connections?error=token", APP_URL)
    );
  }

  let username: string | null = null;
  let providerUserId: string | null = null;

  try {
    const meRes = await fetch("https://api.linkedin.com/v2/me", {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
        "X-Restli-Protocol-Version": "2.0.0",
      },
    });

    if (meRes.ok) {
      const me = (await meRes.json()) as {
        id?: string;
        localizedFirstName?: string;
        localizedLastName?: string;
      };
      providerUserId = me.id ?? null;
      const first = me.localizedFirstName ?? "";
      const last = me.localizedLastName ?? "";
      const fullName = `${first} ${last}`.trim();
      username = fullName || null;
    }
  } catch (e) {
    console.error("LinkedIn profile fetch failed:", e);
  }

  const expiresAt = tokenData.expires_in
    ? new Date(Date.now() + tokenData.expires_in * 1000).toISOString()
    : null;

  try {
    await supabase.from("connected_accounts").upsert(
      {
        user_id: user.id,
        provider: "linkedin",
        encrypted_access_token: encrypt(tokenData.access_token),
        encrypted_refresh_token: tokenData.refresh_token
          ? encrypt(tokenData.refresh_token)
          : null,
        username,
        provider_user_id: providerUserId,
        expires_at: expiresAt,
      },
      { onConflict: "user_id,provider" }
    );
  } catch (e) {
    console.error("Save LinkedIn connected account failed:", e);
    const res = NextResponse.redirect(
      new URL("/dashboard/connections?error=save", APP_URL)
    );
    res.cookies.delete("linkedin_oauth_state");
    return res;
  }

  const res = NextResponse.redirect(
    new URL("/dashboard/connections?info=linkedin_connected", APP_URL)
  );
  res.cookies.delete("linkedin_oauth_state");
  return res;
}

