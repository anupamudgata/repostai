// src/lib/social/types.ts

/** Platforms that have social posting / OAuth integration. */
export type SocialPlatform = "linkedin" | "twitter" | "instagram" | "facebook" | "reddit";

/** Re-export for backward compat — social module uses SocialPlatform internally. */
export type Platform = SocialPlatform;

export interface ConnectedAccount {
  id:               string;
  platform:         SocialPlatform;
  platformUserId:   string;
  platformUsername: string;
  platformAvatar:   string | null;
  tokenExpiresAt:   string | null;
  meta:             Record<string, unknown> | null;
}

export interface PostPayload { platform: SocialPlatform; text: string; userId: string; }
export interface PostResult  { platform: string; success: boolean; postId?: string; postUrl?: string; error?: string; }
