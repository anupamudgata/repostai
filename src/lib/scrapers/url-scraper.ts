import * as cheerio from "cheerio";

export async function scrapeUrl(url: string): Promise<string> {
  const response = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (compatible; RepostAI/1.0; +https://repostai.com)",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch URL: ${response.status} ${response.statusText}`);
  }

  const html = await response.text();
  const $ = cheerio.load(html);

  // Remove non-content elements
  $(
    "script, style, nav, footer, header, aside, .sidebar, .menu, .nav, .footer, .header, .ad, .advertisement, .comments, #comments"
  ).remove();

  // Try to find the main article content
  const selectors = [
    "article",
    '[role="main"]',
    ".post-content",
    ".article-content",
    ".entry-content",
    ".content",
    "main",
  ];

  let content = "";

  for (const selector of selectors) {
    const el = $(selector);
    if (el.length > 0) {
      content = el.text();
      break;
    }
  }

  if (!content) {
    content = $("body").text();
  }

  // Clean up whitespace
  content = content
    .replace(/\s+/g, " ")
    .replace(/\n\s*\n/g, "\n\n")
    .trim();

  // Limit to ~5000 words to stay within token limits
  const words = content.split(/\s+/);
  if (words.length > 5000) {
    content = words.slice(0, 5000).join(" ") + "...";
  }

  if (!content || content.length < 50) {
    throw new Error(
      "Could not extract meaningful content from this URL. Try pasting the text directly."
    );
  }

  return content;
}
