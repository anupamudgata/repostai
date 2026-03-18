import { FREE_TIER_WATERMARK, FREE_TIER_WATERMARK_SHORT } from "@/config/constants";

/** Appends free-tier watermark to content. Twitter platforms use short watermark to fit 280 chars. */
export function addFreeTierWatermark(
  outputs: Record<string, string>
): Record<string, string> {
  const twitterPlatforms = ["twitter_single", "twitter_thread"];
  return Object.fromEntries(
    Object.entries(outputs).map(([platform, content]) => {
      const wm = twitterPlatforms.includes(platform) ? FREE_TIER_WATERMARK_SHORT : FREE_TIER_WATERMARK;
      if (platform === "twitter_thread") {
        const lines = content.trimEnd().split(/\n/);
        const lastIdx = lines.length - 1;
        if (lastIdx >= 0) {
          const last = lines[lastIdx]!;
          const lastWithWm = last.trimEnd() + wm;
          lines[lastIdx] = lastWithWm.length <= 280 ? lastWithWm : (last.trimEnd().slice(0, 280 - wm.length) + wm).slice(0, 280);
        }
        return [platform, lines.join("\n")];
      }
      const withWatermark = content.trimEnd() + wm;
      if (platform === "twitter_single" && withWatermark.length > 280) {
        return [platform, (content.trimEnd().slice(0, 280 - wm.length) + wm).slice(0, 280)];
      }
      return [platform, withWatermark];
    })
  ) as Record<string, string>;
}
