import { NextRequest, NextResponse } from "next/server";
import { APP_URL } from "@/config/constants";
import { upsertToken } from "@/lib/social/token-store";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const err = url.searchParams.get("error");
  const cookieState = req.cookies.get("instagram_oauth_state")?.value;

  if (err) {
    return NextResponse.redirect(
      new URL(`/dashboard/connections?error=${encodeURIComponent(err)}`, APP_URL)
    );
  }

  if (!code || !state || !cookieState || state !== cookieState) {
    return NextResponse.redirect(
      new URL("/dashboard/connections?error=invalid_callback", APP_URL)
    );
  }

  let userId: string;
  try {
    const parsed = JSON.parse(
      Buffer.from(state, "base64url").toString("utf-8")
    ) as { userId?: string };
    if (!parsed.userId) throw new Error("missing user");
    userId = parsed.userId;
  } catch {
    return NextResponse.redirect(
      new URL("/dashboard/connections?error=bad_state", APP_URL)
    );
  }

  const appId = process.env.FACEBOOK_APP_ID?.trim() || process.env.META_APP_ID?.trim();
  const appSecret =
    process.env.FACEBOOK_APP_SECRET?.trim() || process.env.META_APP_SECRET?.trim();
  if (!appId || !appSecret) {
    return NextResponse.redirect(
      new URL("/dashboard/connections?error=meta_config", APP_URL)
    );
  }

  const redirectUri = `${APP_URL.replace(/\/$/, "")}/api/social/callback/instagram`;

  try {
    const tokenUrl = new URL("https://graph.facebook.com/v21.0/oauth/access_token");
    tokenUrl.searchParams.set("client_id", appId);
    tokenUrl.searchParams.set("client_secret", appSecret);
    tokenUrl.searchParams.set("redirect_uri", redirectUri);
    tokenUrl.searchParams.set("code", code);

    const tokenRes = await fetch(tokenUrl.toString());
    const tokenJson = (await tokenRes.json()) as {
      access_token?: string;
      error?: { message?: string };
    };
    if (!tokenRes.ok || !tokenJson.access_token) {
      console.error("[instagram callback] token", tokenJson);
      return NextResponse.redirect(
        new URL("/dashboard/connections?error=token", APP_URL)
      );
    }

    const userToken = tokenJson.access_token;

    const pagesRes = await fetch(
      `https://graph.facebook.com/v21.0/me/accounts?fields=id,name,access_token,instagram_business_account&access_token=${encodeURIComponent(userToken)}`
    );
    const pagesJson = (await pagesRes.json()) as {
      data?: Array<{
        id: string;
        name?: string;
        access_token: string;
        instagram_business_account?: { id: string };
      }>;
      error?: { message?: string };
    };

    if (!pagesRes.ok || !pagesJson.data?.length) {
      console.error("[instagram callback] pages", pagesJson);
      return NextResponse.redirect(
        new URL("/dashboard/connections?error=no_pages", APP_URL)
      );
    }

    const withIg = pagesJson.data.find((p) => p.instagram_business_account?.id);
    if (!withIg?.instagram_business_account?.id || !withIg.access_token) {
      return NextResponse.redirect(
        new URL(
          "/dashboard/connections?error=no_instagram_business",
          APP_URL
        )
      );
    }

    const igId = withIg.instagram_business_account.id;
    const pageToken = withIg.access_token;
    const pageId = withIg.id;

    let igUsername: string | undefined;
    try {
      const igRes = await fetch(
        `https://graph.facebook.com/v21.0/${igId}?fields=username&access_token=${encodeURIComponent(pageToken)}`
      );
      const igProfile = (await igRes.json()) as { username?: string };
      igUsername = igProfile.username;
    } catch {
      /* optional */
    }

    await upsertToken(userId, "instagram", {
      accessToken: pageToken,
      platformUserId: igId,
      platformUsername: igUsername ?? withIg.name ?? "Instagram",
      meta: {
        pageId,
        instagramAccountId: igId,
        pageAccessToken: pageToken,
      },
    });

    const res = NextResponse.redirect(
      new URL("/dashboard/connections?connected=instagram", APP_URL)
    );
    res.cookies.delete("instagram_oauth_state");
    return res;
  } catch (e) {
    console.error("[instagram callback]", e);
    return NextResponse.redirect(
      new URL("/dashboard/connections?error=connection_failed", APP_URL)
    );
  }
}
