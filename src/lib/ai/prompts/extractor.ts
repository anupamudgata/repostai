export function buildExtractorPrompt(rawContent: string, outputLanguage?: string): string {
  const hindiGuard = outputLanguage === "hi"
    ? `
HINDI OUTPUT CONTEXT:
- The extracted brief will be used to generate Hinglish (Hindi + English) social content.
- If the source content contains Hindi words, idioms, cultural references, or Hinglish phrases, PRESERVE them naturally in coreMessage and keyPoints — do NOT translate them to formal English.
- Keep JSON keys in English. Values can be in Hinglish if the source is Hindi/Hinglish.
- Preserve Indian cultural context: festival references, cricket analogies, Bollywood mentions, desi humor, regional expressions.
- Example: if source says "jugaad se काम चला लिया", keep that flavor — don't write "managed through improvisation".
- Audience should reflect Indian context if present (e.g. "Indian startup founders", "Hindi-speaking creators").
`
    : "";

  return `You are a content analyst. Your job is to read content and extract a structured brief that other AI agents will use to repurpose it.

Analyse the content below and respond with ONLY valid JSON matching this exact structure:
{
  "coreMessage": "The single most important idea in 1-2 sentences",
  "keyPoints": ["point 1", "point 2", "point 3", "point 4", "point 5"],
  "audience": "Who this content is written for (be specific: e.g. 'early-stage SaaS founders', 'fitness beginners', 'senior engineers')",
  "tone": "One of: professional, conversational, educational, inspirational, humorous, vulnerable, authoritative",
  "contentType": "One of: blog_post, youtube, article, thread, text"
}

Rules:
- keyPoints must be 3-6 items. Each must be a standalone insight, not a vague summary.
- coreMessage must be the ONE idea someone should remember after reading this.
- If the content is a YouTube transcript, focus on the spoken insights, not the video description.
- Respond with ONLY the JSON object. No preamble, no explanation, no markdown code fences.
${hindiGuard}
CONTENT:
---
${rawContent}
---`;
}
