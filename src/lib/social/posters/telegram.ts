import { getToken } from "@/lib/social/token-store";
import type { PostResult } from "@/lib/social/types";

const TG_API = (token: string, method: string) =>
  `https://api.telegram.org/bot${token}/${method}`;

export async function postToTelegram(
  userId: string,
  text: string,
  imageUrl?: string
): Promise<PostResult> {
  const token = await getToken(userId, "telegram");
  if (!token) return { platform: "telegram", success: false, error: "Telegram not connected" };

  const botToken = token.accessToken;
  const chatId = token.platformUsername; // stored as @channel or group id

  try {
    if (imageUrl) {
      // sendPhoto with caption
      const res = await fetch(TG_API(botToken, "sendPhoto"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id: chatId, photo: imageUrl, caption: text.slice(0, 1024), parse_mode: "HTML" }),
      });
      const data = await res.json() as { ok: boolean; result?: { message_id: number }; description?: string };
      if (!data.ok) throw new Error(data.description ?? "Telegram API error");
      const msgId = data.result?.message_id;
      return { platform: "telegram", success: true, postId: String(msgId), postUrl: `https://t.me/${chatId!.replace("@", "")}/${msgId}` };
    } else {
      // sendMessage — split if >4096 chars
      const chunks = splitMessage(text, 4096);
      let lastMsgId: number | undefined;
      for (const chunk of chunks) {
        const res = await fetch(TG_API(botToken, "sendMessage"), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ chat_id: chatId, text: chunk, parse_mode: "HTML" }),
        });
        const data = await res.json() as { ok: boolean; result?: { message_id: number }; description?: string };
        if (!data.ok) throw new Error(data.description ?? "Telegram API error");
        lastMsgId = data.result?.message_id;
      }
      const msgId = lastMsgId;
      return { platform: "telegram", success: true, postId: String(msgId), postUrl: `https://t.me/${chatId!.replace("@", "")}/${msgId}` };
    }
  } catch (err) {
    return { platform: "telegram", success: false, error: err instanceof Error ? err.message : "Unknown error" };
  }
}

function splitMessage(text: string, maxLen: number): string[] {
  if (text.length <= maxLen) return [text];
  const parts: string[] = [];
  let remaining = text;
  while (remaining.length > maxLen) {
    let idx = remaining.lastIndexOf("\n", maxLen - 1);
    if (idx < maxLen * 0.5) idx = remaining.lastIndexOf(" ", maxLen - 1);
    if (idx < 0) idx = maxLen - 1;
    parts.push(remaining.slice(0, idx + 1).trim());
    remaining = remaining.slice(idx + 1).trim();
  }
  if (remaining) parts.push(remaining);
  return parts;
}
