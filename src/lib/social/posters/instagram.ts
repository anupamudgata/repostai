import { getToken } from "@/lib/social/token-store";
import type { PostResult } from "@/lib/social/types";

const GRAPH_VERSION = "v21.0";
const GRAPH_BASE = `https://graph.facebook.com/${GRAPH_VERSION}`;

/**
 * Publish a feed photo to Instagram via Graph API (Business/Creator + linked FB Page).
 * Expects `connected_accounts.meta.instagramAccountId` and page access token in `access_token`.
 */
export async function postInstagramPhoto(
  userId: string,
  imageUrl: string,
  caption: string
): Promise<PostResult> {
  const token = await getToken(userId, "instagram");
  if (!token) {
    return { platform: "instagram", success: false, error: "Instagram not connected" };
  }

  const igAccountId =
    (token.meta?.instagramAccountId as string | undefined) ||
    (token.meta?.instagram_account_id as string | undefined);
  const accessToken = token.accessToken;

  if (!igAccountId) {
    return {
      platform: "instagram",
      success: false,
      error:
        "Instagram Business account not linked. Open Connections and reconnect Instagram.",
    };
  }

  try {
    const containerBody = new URLSearchParams({
      image_url: imageUrl,
      caption: caption.slice(0, 2200),
      access_token: accessToken,
    });

    const containerRes = await fetch(
      `${GRAPH_BASE}/${igAccountId}/media`,
      { method: "POST", body: containerBody }
    );
    const containerJson = (await containerRes.json()) as {
      id?: string;
      error?: { message?: string };
    };
    if (!containerRes.ok || !containerJson.id) {
      return {
        platform: "instagram",
        success: false,
        error:
          containerJson.error?.message ??
          `Instagram container failed (${containerRes.status})`,
      };
    }

    const publishBody = new URLSearchParams({
      creation_id: containerJson.id,
      access_token: accessToken,
    });
    const publishRes = await fetch(
      `${GRAPH_BASE}/${igAccountId}/media_publish`,
      { method: "POST", body: publishBody }
    );
    const publishJson = (await publishRes.json()) as {
      id?: string;
      error?: { message?: string };
    };
    if (!publishRes.ok || !publishJson.id) {
      return {
        platform: "instagram",
        success: false,
        error:
          publishJson.error?.message ??
          `Instagram publish failed (${publishRes.status})`,
      };
    }

    let postUrl: string | undefined;
    try {
      const permRes = await fetch(
        `${GRAPH_BASE}/${publishJson.id}?fields=permalink&access_token=${encodeURIComponent(accessToken)}`
      );
      const permJson = (await permRes.json()) as { permalink?: string };
      if (permJson.permalink) postUrl = permJson.permalink;
    } catch {
      /* non-fatal */
    }

    return {
      platform: "instagram",
      success: true,
      postId: publishJson.id,
      postUrl: postUrl ?? "https://www.instagram.com/",
    };
  } catch (e) {
    return {
      platform: "instagram",
      success: false,
      error: e instanceof Error ? e.message : "Instagram post failed",
    };
  }
}
