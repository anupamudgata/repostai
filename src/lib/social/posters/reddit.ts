import { getToken, upsertToken, isTokenExpired } from "@/lib/social/token-store";
import type { PostResult }                        from "@/lib/social/types";

async function refreshRedditToken(userId: string, refreshToken: string): Promise<string | null> {
  const credentials = Buffer.from(`${process.env.REDDIT_CLIENT_ID}:${process.env.REDDIT_CLIENT_SECRET}`).toString("base64");
  const response = await fetch("https://www.reddit.com/api/v1/access_token", {
    method: "POST",
    headers: { Authorization: `Basic ${credentials}`, "Content-Type": "application/x-www-form-urlencoded", "User-Agent": "RepostAI/1.0" },
    body: new URLSearchParams({ grant_type: "refresh_token", refresh_token: refreshToken }),
  });
  if (!response.ok) return null;
  const data = await response.json();
  await upsertToken(userId, "reddit", { accessToken: data.access_token, refreshToken: data.refresh_token ?? refreshToken, expiresInSeconds: data.expires_in, platformUserId: "" });
  return data.access_token;
}

export async function postToReddit(userId: string, text: string, subreddit: string): Promise<PostResult> {
  const token = await getToken(userId, "reddit");
  if (!token) return { platform: "reddit", success: false, error: "Reddit not connected" };
  let accessToken = token.accessToken;
  if (isTokenExpired(token.tokenExpiresAt) && token.refreshToken) {
    const newToken = await refreshRedditToken(userId, token.refreshToken);
    if (!newToken) return { platform: "reddit", success: false, error: "Reddit session expired. Please reconnect." };
    accessToken = newToken;
  }
  const lines = text.split("\n").filter(Boolean);
  const title = lines[0]?.slice(0, 300) ?? "Post from RepostAI";
  const body  = lines.slice(1).join("\n") || text;
  try {
    const response = await fetch("https://oauth.reddit.com/api/submit", {
      method: "POST",
      headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/x-www-form-urlencoded", "User-Agent": "RepostAI/1.0" },
      body: new URLSearchParams({ kind: "self", sr: subreddit.replace(/^r\//, ""), title, text: body, nsfw: "false", resubmit: "true" }),
    });
    if (!response.ok) { const err = await response.json().catch(() => ({})); return { platform: "reddit", success: false, error: err.message ?? `Reddit API error ${response.status}` }; }
    const data = await response.json();
    return { platform: "reddit", success: true, postUrl: data.jquery?.[10]?.[3]?.[0] ?? "" };
  } catch (err) {
    return { platform: "reddit", success: false, error: err instanceof Error ? err.message : "Unknown error" };
  }
}
