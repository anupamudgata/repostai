import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { scrapeUrl } from "@/lib/scrapers/url-scraper";
import { openai } from "@/lib/ai/client";

/** Platform ID to provider for scheduling (only these can be scheduled via API) */
const SCHEDULABLE: Record<string, string> = {
  linkedin: "linkedin",
  twitter_thread: "twitter",
  twitter_single: "twitter",
};

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const url = body.url as string | undefined;
    if (!url?.trim()) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    let content: string;
    try {
      content = await scrapeUrl(url.trim());
    } catch (e) {
      const msg = e instanceof Error ? e.message : "";
      if (msg.includes("Could not extract") || msg.includes("Invalid URL")) {
        return NextResponse.json(
          { error: "Could not extract content from this URL. Use a publicly accessible blog URL." },
          { status: 400 }
        );
      }
      if (msg.includes("Failed to fetch") || msg.includes("404") || msg.includes("403")) {
        return NextResponse.json(
          { error: "Could not fetch this URL. The page may be private, behind a paywall, or the URL may be incorrect." },
          { status: 400 }
        );
      }
      if (msg.includes("too long") || msg.includes("AbortError")) {
        return NextResponse.json(
          { error: "The URL took too long to respond. Try pasting the text directly in Repurpose." },
          { status: 400 }
        );
      }
      if (msg.includes("not allowed")) {
        return NextResponse.json(
          { error: "This URL is not allowed. Use a public blog URL." },
          { status: 400 }
        );
      }
      return NextResponse.json(
        { error: msg || "Could not fetch this URL. Please use a publicly accessible blog URL." },
        { status: 400 }
      );
    }

    const { data: accounts } = await supabase
      .from("connected_accounts")
      .select("id, platform")
      .eq("user_id", user.id);

    const connectedProviders = new Set((accounts ?? []).map((a) => a.platform));
    const canScheduleLinkedIn = connectedProviders.has("linkedin");
    const canScheduleTwitter = connectedProviders.has("twitter");

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.4,
      messages: [
        {
          role: "system",
          content: `You are a content strategy agent. Analyze blog content and suggest the best platforms and posting schedule for the week.
Return ONLY valid JSON, no markdown. Format:
{
  "platforms": [
    {
      "platform": "linkedin" | "twitter_thread" | "twitter_single" | "instagram" | "facebook" | "email",
      "reason": "1 sentence why this platform fits",
      "suggestedDay": "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat" | "Sun",
      "suggestedTime": "09:00" (24h, UTC)
    }
  ]
}
Rules:
- Suggest 3-5 platforms based on content fit. Prioritize LinkedIn and Twitter for B2B/professional content.
- suggestedDay: spread across the week (Mon-Sun). Don't put all on same day.
- suggestedTime: LinkedIn best Tue-Thu 8-10am UTC; Twitter 9am or 2pm UTC. Use 09:00, 14:00, 18:00 type slots.
- Include "reason" for each platform. We'll handle scheduling separately.`,
        },
        {
          role: "user",
          content: `Content (first 3000 chars):\n${content.slice(0, 3000)}\n\nUser can schedule LinkedIn: ${canScheduleLinkedIn}. User can schedule Twitter: ${canScheduleTwitter}. Suggest platforms and a weekly schedule.`,
        },
      ],
      response_format: { type: "json_object" },
    });

    const raw = response.choices[0]?.message?.content ?? "{}";
    let parsed: { platforms?: Array<{ platform: string; reason: string; suggestedDay: string; suggestedTime: string }> };
    try {
      parsed = JSON.parse(raw) as typeof parsed;
    } catch {
      return NextResponse.json({ error: "AI returned invalid format" }, { status: 500 });
    }

    const platforms = (parsed.platforms ?? []).filter((p) =>
      ["linkedin", "twitter_thread", "twitter_single", "instagram", "facebook", "email"].includes(p.platform)
    );

    const dayToOffset: Record<string, number> = {
      Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6,
    };

    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setUTCDate(now.getUTCDate() - now.getUTCDay());
    startOfWeek.setUTCHours(0, 0, 0, 0);

    const schedule = platforms.map((p) => {
      const dayOffset = dayToOffset[p.suggestedDay] ?? 1;
      const [h, m] = (p.suggestedTime || "09:00").split(":").map(Number);
      const at = new Date(startOfWeek);
      at.setUTCDate(at.getUTCDate() + dayOffset);
      at.setUTCHours(h || 9, m || 0, 0, 0);
      if (at.getTime() <= Date.now()) {
        at.setUTCDate(at.getUTCDate() + 7);
      }
      const provider = SCHEDULABLE[p.platform];
      const account = provider ? accounts?.find((a) => a.platform === provider) : null;
      return {
        platform: p.platform,
        reason: p.reason,
        scheduledAt: at.toISOString(),
        canSchedule: !!account,
        connectedAccountId: account?.id ?? null,
      };
    });

    return NextResponse.json({
      contentPreview: content.slice(0, 500),
      schedule,
      connectedAccounts: accounts ?? [],
    });
  } catch (error) {
    console.error("Agent plan error:", error);
    const msg = error instanceof Error ? error.message : "Something went wrong";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
