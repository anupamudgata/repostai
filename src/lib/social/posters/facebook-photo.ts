import { getToken } from "@/lib/social/token-store";
import type { PostResult } from "@/lib/social/types";

const GRAPH_VERSION = "v21.0";

/**
 * Publish a photo to a Facebook Page using a public image URL.
 * Reuses the same Page token + pageId as text posts (`meta.pageId`, `meta.pageAccessToken`).
 */
export async function postFacebookPagePhoto(
  userId: string,
  imageUrl: string,
  caption: string
): Promise<PostResult> {
  const token = await getToken(userId, "facebook");
  if (!token) {
    return { platform: "facebook", success: false, error: "Facebook not connected" };
  }

  const pageId =
    (token.meta?.pageId as string | undefined) ||
    (token.meta?.page_id as string | undefined);
  const pageAccessToken =
    (token.meta?.pageAccessToken as string | undefined) ||
    token.accessToken;

  if (!pageId || !pageAccessToken) {
    return {
      platform: "facebook",
      success: false,
      error: "Facebook Page not configured. Reconnect Facebook in Connections.",
    };
  }

  try {
    const body = new URLSearchParams({
      url: imageUrl,
      caption,
      published: "true",
      access_token: pageAccessToken,
    });

    const response = await fetch(
      `https://graph.facebook.com/${GRAPH_VERSION}/${pageId}/photos`,
      { method: "POST", body }
    );
    const data = (await response.json()) as {
      id?: string;
      post_id?: string;
      error?: { message?: string };
    };
    if (!response.ok || !data.id) {
      return {
        platform: "facebook",
        success: false,
        error: data.error?.message ?? `Facebook API error ${response.status}`,
      };
    }

    const postId = data.post_id ?? data.id;
    return {
      platform: "facebook",
      success: true,
      postId,
      postUrl: postId ? `https://www.facebook.com/${postId}` : undefined,
    };
  } catch (e) {
    return {
      platform: "facebook",
      success: false,
      error: e instanceof Error ? e.message : "Facebook photo post failed",
    };
  }
}
