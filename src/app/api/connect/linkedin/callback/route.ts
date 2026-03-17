import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

function getBaseUrl(request: NextRequest): string {
  const host = request.headers.get("x-forwarded-host");
  const proto = request.headers.get("x-forwarded-proto") ?? "https";
  if (host) return `${proto === "https" ? "https" : "http"}://${host}`;
  return request.nextUrl.origin;
}

export async function GET(request: NextRequest) {
  const baseUrl = getBaseUrl(request);
  const url = new URL(request.url);
  const searchParams = url.searchParams;
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const errorParam = searchParams.get("error");

  if (errorParam) {
    return NextResponse.redirect(
      new URL("/dashboard/connections?error=token", baseUrl)
    );
  }

  const cookieState = request.cookies.get("linkedin_oauth_state")?.value;

  if (!code || !state || state !== cookieState) {
    return NextResponse.redirect(
      new URL("/dashboard/connections?error=invalid_callback", baseUrl)
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(new URL("/login", baseUrl));
  }

  const clientId = process.env.LINKEDIN_CLIENT_ID;
  const clientSecret = process.env.LINKEDIN_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return NextResponse.redirect(
      new URL("/dashboard/connections?error=config", baseUrl)
    );
  }

  const redirectUri = `${baseUrl}/api/connect/linkedin/callback`;
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
      new URL("/dashboard/connections?error=token", baseUrl)
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
      new URL("/dashboard/connections?error=token", baseUrl)
    );
  }

  let platformUsername: string | null = null;
  let platformUserId: string = "unknown";

  try {
    const userInfoRes = await fetch("https://api.linkedin.com/v2/userinfo", {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });
    if (userInfoRes.ok) {
      const userInfo = (await userInfoRes.json()) as {
        sub?: string;
        name?: string;
        given_name?: string;
        family_name?: string;
      };
      platformUserId = userInfo.sub ?? "unknown";
      platformUsername = userInfo.name ?? ([userInfo.given_name, userInfo.family_name].filter(Boolean).join(" ") || null);
    }
  } catch {
    try {
      const meRes = await fetch("https://api.linkedin.com/v2/me", {
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`,
          "X-Restli-Protocol-Version": "2.0.0",
        },
      });
      if (meRes.ok) {
        const me = (await meRes.json()) as { id?: string; localizedFirstName?: string; localizedLastName?: string };
        platformUserId = me.id ?? "unknown";
        const first = me.localizedFirstName ?? "";
        const last = me.localizedLastName ?? "";
        platformUsername = `${first} ${last}`.trim() || null;
      }
    } catch (e) {
      console.error("LinkedIn profile fetch failed:", e);
    }
  }

  const tokenExpiresAt = tokenData.expires_in
    ? new Date(Date.now() + tokenData.expires_in * 1000).toISOString()
    : null;

  try {
    await supabase.from("connected_accounts").upsert(
      {
        user_id: user.id,
        platform: "linkedin",
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token ?? null,
        platform_username: platformUsername,
        platform_user_id: platformUserId,
        token_expires_at: tokenExpiresAt,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id,platform" }
    );
  } catch (e) {
    console.error("Save LinkedIn connected account failed:", e);
    const res = NextResponse.redirect(
      new URL("/dashboard/connections?error=save", baseUrl)
    );
    res.cookies.delete("linkedin_oauth_state");
    return res;
  }

  const res = NextResponse.redirect(
    new URL("/dashboard/connections?info=linkedin_connected", baseUrl)
  );
  res.cookies.delete("linkedin_oauth_state");
  return res;
}

