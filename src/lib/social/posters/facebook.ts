// src/lib/social/posters/facebook.ts
import { getToken } from "@/lib/social/token-store";
import type { PostResult } from "@/lib/social/types";

export async function postToFacebook(userId: string, text: string): Promise<PostResult> {
  const token = await getToken(userId, "facebook");
  if (!token) return { platform: "facebook", success: false, error: "Facebook not connected" };
  const pageId          = token.meta?.pageId as string | undefined;
  const pageAccessToken = token.meta?.pageAccessToken as string | undefined;
  if (!pageId || !pageAccessToken) return { platform: "facebook", success: false, error: "Facebook Page not configured. Please reconnect." };
  try {
    const response = await fetch(`https://graph.facebook.com/v21.0/${pageId}/feed`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: text, access_token: pageAccessToken }),
    });
    if (!response.ok) { const err = await response.json().catch(() => ({})); return { platform: "facebook", success: false, error: err.error?.message ?? `Facebook API error ${response.status}` }; }
    const data = await response.json();
    return { platform: "facebook", success: true, postId: data.id ?? "", postUrl: `https://facebook.com/${data.id}` };
  } catch (err) {
    return { platform: "facebook", success: false, error: err instanceof Error ? err.message : "Unknown error" };
  }
}
