import type { Platform } from "@/types";

const PLATFORM_INSTRUCTIONS: Record<Platform, string> = {
  linkedin: `Write a LinkedIn post. Use a strong hook in the first line. 
Break into short paragraphs (1-2 sentences each). Use line breaks for readability. 
Include a call-to-action at the end. Keep it professional but conversational. 
Add 3-5 relevant hashtags at the bottom. Max 3000 characters.`,

  twitter_thread: `Write a Twitter/X thread of 4-7 tweets. 
First tweet must be a compelling hook that makes people want to read more. 
Each tweet must be under 280 characters. Number them (1/, 2/, etc.). 
End with a summary tweet and call-to-action. Make it punchy and direct.`,

  twitter_single: `Write a single Twitter/X post under 280 characters. 
Make it punchy, direct, and engaging. Include 1-2 relevant hashtags if space allows. 
Use strong verbs and create curiosity.`,

  instagram: `Write an Instagram caption. Start with a compelling first line (this shows in preview). 
Use short paragraphs with line breaks. Include a call-to-action (comment, save, share). 
Add 15-20 relevant hashtags at the end, separated by a line break. Max 2200 characters.`,

  facebook: `Write a Facebook post. Use a conversational, friendly tone. 
Start with a question or hook. Keep paragraphs short (2-3 sentences). 
Include a call-to-action. Emojis are okay but don't overdo it.`,

  email: `Write an email newsletter intro paragraph (3-5 sentences). 
Use a compelling subject line suggestion at the top. 
The intro should hook the reader and summarize the key takeaway. 
Include a transition sentence to the main content. Keep it concise and scannable.`,

  reddit: `Write a Reddit post. Use a clear, descriptive title. 
Write in a genuine, non-promotional tone — Reddit users hate marketing speak. 
Provide real value and insights. Structure with short paragraphs. 
End with a question to encourage discussion. No hashtags, no emojis.`,
};

export function buildRepurposePrompt(
  content: string,
  platforms: Platform[],
  brandVoice?: string
): string {
  const platformSections = platforms
    .map(
      (platform) =>
        `### ${platform.toUpperCase()}\n${PLATFORM_INSTRUCTIONS[platform]}`
    )
    .join("\n\n");

  const voiceInstruction = brandVoice
    ? `\n\nIMPORTANT - BRAND VOICE: Match this writing style closely. Here are examples of the user's writing:\n---\n${brandVoice}\n---\nMimic their tone, vocabulary, sentence structure, and personality. The output should sound like THEM, not like AI.`
    : "";

  return `You are a world-class content strategist. Your job is to repurpose the following content into platform-specific posts that feel native to each platform.

RULES:
- Each output must feel like it was written specifically for that platform
- Preserve the core message and key insights from the original content
- Do NOT just copy-paste — adapt tone, format, and structure for each platform
- Make every post engaging and actionable
- Never use generic filler phrases like "In today's fast-paced world"${voiceInstruction}

ORIGINAL CONTENT:
---
${content}
---

Generate content for each platform below. Return ONLY a JSON object with platform names as keys and generated content as values. No markdown, no explanation — just the JSON.

${platformSections}

Return format:
{
  "${platforms[0]}": "generated content here",
  ...
}`;
}
