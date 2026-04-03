import { postInstagramPhoto } from "@/lib/social/posters/instagram";
import { postFacebookPagePhoto } from "@/lib/social/posters/facebook-photo";
import { postToTwitter } from "@/lib/social/posters/twitter";
import { postToLinkedIn } from "@/lib/social/posters/linkedin";
import type { PostResult } from "@/lib/social/types";
import type { PhotoPostPlatform } from "@/lib/photos/generate-captions";

export type PhotoCaptionPayload = Record<string, string>;

/**
 * Posts photo captions to connected platforms. Instagram & Facebook attach the public image URL.
 * Twitter / LinkedIn: caption text only (image attachment not implemented in this path).
 */
export async function postPhotoCaptionsToPlatforms(
  userId: string,
  publicImageUrl: string,
  captions: PhotoCaptionPayload,
  platforms: PhotoPostPlatform[]
): Promise<PostResult[]> {
  const results: PostResult[] = [];

  for (const platform of platforms) {
    const text = (captions[platform] ?? "").trim();
    if (!text) {
      results.push({
        platform: platform === "twitter" ? "twitter" : platform,
        success: false,
        error: "Empty caption",
      });
      continue;
    }

    switch (platform) {
      case "instagram": {
        results.push(
          await postInstagramPhoto(userId, publicImageUrl, text)
        );
        break;
      }
      case "facebook": {
        results.push(
          await postFacebookPagePhoto(userId, publicImageUrl, text)
        );
        break;
      }
      case "twitter": {
        const r = await postToTwitter(userId, text, publicImageUrl);
        results.push(r);
        break;
      }
      case "linkedin": {
        const r = await postToLinkedIn(userId, text, publicImageUrl);
        results.push(r);
        break;
      }
      default: {
        const _x: never = platform;
        results.push({
          platform: "twitter",
          success: false,
          error: `Unsupported platform: ${String(_x)}`,
        });
      }
    }
  }

  return results;
}
