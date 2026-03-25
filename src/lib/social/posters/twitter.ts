import { getToken, upsertToken, isTokenExpired } from "@/lib/social/token-store";
import type { PostResult }                        from "@/lib/social/types";

async function refreshTwitterToken(userId: string, refreshToken: string): Promise<string | null> {
  const credentials = Buffer.from(`${process.env.TWITTER_CLIENT_ID}:${process.env.TWITTER_CLIENT_SECRET}`).toString("base64");
  const response = await fetch("https://api.twitter.com/2/oauth2/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded", Authorization: `Basic ${credentials}` },
    body: new URLSearchParams({ grant_type: "refresh_token", refresh_token: refreshToken }),
  });
  if (!response.ok) return null;
  const data = await response.json();
  await upsertToken(userId, "twitter", { accessToken: data.access_token, refreshToken: data.refresh_token, expiresInSeconds: data.expires_in, platformUserId: "" });
  return data.access_token;
}

/** Post to Twitter using a raw access token (e.g. from connected_accounts). Used by API post route and cron. */
export async function postToTwitterWithToken(text: string, accessToken: string): Promise<{ id: string }> {
  const tweetText = text.length > 280 ? text.slice(0, 277) + "..." : text;
  const response = await fetch("https://api.twitter.com/2/tweets", {
    method: "POST",
    headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
    body: JSON.stringify({ text: tweetText }),
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error((err as { detail?: string })?.detail ?? `Twitter API error ${response.status}`);
  }
  const json = (await response.json()) as { data?: { id?: string } };
  return { id: json.data?.id ?? "" };
}

export async function postToTwitter(userId: string, text: string): Promise<PostResult> {
  const token = await getToken(userId, "twitter");
  if (!token) return { platform: "twitter", success: false, error: "Twitter not connected" };
  let accessToken = token.accessToken;
  if (isTokenExpired(token.tokenExpiresAt) && token.refreshToken) {
    const newToken = await refreshTwitterToken(userId, token.refreshToken);
    if (!newToken) return { platform: "twitter", success: false, error: "Twitter session expired. Please reconnect." };
    accessToken = newToken;
  }
  try {
    const tweet = await postToTwitterWithToken(text, accessToken);
    const postId = tweet.id;
    return { platform: "twitter", success: true, postId, postUrl: `https://x.com/${token.platformUsername}/status/${postId}` };
  } catch (err) {
    return { platform: "twitter", success: false, error: err instanceof Error ? err.message : "Unknown error" };
  }
}
