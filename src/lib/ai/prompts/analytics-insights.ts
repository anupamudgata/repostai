export function buildAnalyticsInsightsPrompt(data: {
  posts: Array<{
    platform: string;
    posted_at: string;
    likes: number;
    comments: number;
    shares: number;
    impressions: number;
    content_preview?: string;
  }>;
  summary: {
    totalPosts: number;
    totalEngagement: number;
    byPlatform: Record<string, { count: number; avgEngagement: number }>;
    byDayOfWeek: Record<string, number>;
    byHour: Record<string, number>;
  };
}): string {
  const { posts, summary } = data;
  return `You are an expert content strategist and data analyst. Analyze this social media engagement data and provide 3-5 actionable, specific AI-powered insights.

DATA SUMMARY:
- Total posts tracked: ${summary.totalPosts}
- Total engagement (likes + comments + shares): ${summary.totalEngagement}
- Engagement by platform: ${JSON.stringify(summary.byPlatform)}
- Posts by day of week: ${JSON.stringify(summary.byDayOfWeek)}
- Posts by hour (UTC): ${JSON.stringify(summary.byHour)}

SAMPLE POSTS (up to 10):
${posts.slice(0, 10).map((p) => ({
  platform: p.platform,
  posted: p.posted_at,
  likes: p.likes,
  comments: p.comments,
  shares: p.shares,
  impressions: p.impressions,
  preview: (p.content_preview || "").slice(0, 80),
})).map((p) => JSON.stringify(p)).join("\n")}

RULES:
1. Be specific: use numbers, ratios, and time windows (e.g. "3x better on Tuesdays at 10 AM", "LinkedIn gets 2x more comments than Twitter")
2. Each insight should be actionable — tell the user what to do
3. If data is sparse, still provide insights based on best practices and the patterns you see
4. Use a conversational, confident tone
5. Return ONLY a JSON array of strings, each string is one insight. Format: ["insight 1", "insight 2", ...]
6. No markdown, no code block wrapper, just the raw JSON array`;
}
