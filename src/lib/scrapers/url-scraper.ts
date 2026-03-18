import * as cheerio from "cheerio";

const FETCH_TIMEOUT_MS = 15_000;

const BLOCKED_HOSTS = [
  /^localhost$/i,
  /^127\./,
  /^10\./,
  /^172\.(1[6-9]|2\d|3[01])\./,
  /^192\.168\./,
  /^169\.254\./,
  /^0\./,
  /^\[::1\]/,
  /^metadata\.google\.internal$/i,
];

function validateUrl(input: string): URL {
  let parsed: URL;
  try {
    parsed = new URL(input);
  } catch {
    throw new Error("Invalid URL format.");
  }

  if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
    throw new Error("Only http and https URLs are supported.");
  }

  const hostname = parsed.hostname;
  if (BLOCKED_HOSTS.some((pattern) => pattern.test(hostname))) {
    throw new Error("This URL is not allowed.");
  }

  // YouTube pages cannot be scraped meaningfully (video pages, no article body)
  if (/^(www\.)?youtube\.com$/i.test(hostname) || /^youtu\.be$/i.test(hostname)) {
    throw new Error(
      "YouTube URLs cannot be scraped. Use the YouTube option to paste a transcript, or paste your content directly."
    );
  }

  return parsed;
}

export async function scrapeUrl(url: string): Promise<string> {
  const validated = validateUrl(url);

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  let response: Response;
  try {
    response = await fetch(validated.href, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; RepostAI/1.0; +https://repostai.com)",
      },
      signal: controller.signal,
    });
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") {
      throw new Error("URL took too long to respond. Try pasting the text directly.");
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }

  if (!response.ok) {
    throw new Error(`Failed to fetch URL: ${response.status} ${response.statusText}`);
  }

  const html = await response.text();
  const $ = cheerio.load(html);

  $(
    "script, style, nav, footer, header, aside, .sidebar, .menu, .nav, .footer, .header, .ad, .advertisement, .comments, #comments"
  ).remove();

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

  content = content
    .replace(/\n\s*\n/g, "\n\n")
    .replace(/\s+/g, " ")
    .trim();

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
