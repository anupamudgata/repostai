import { getToken } from "@/lib/social/token-store";
import type { PostResult } from "@/lib/social/types";

const WA_API = (phoneNumberId: string) =>
  `https://graph.facebook.com/v18.0/${phoneNumberId}/messages`;

export async function postToWhatsApp(
  userId: string,
  text: string,
  _imageUrl?: string
): Promise<PostResult> {
  const token = await getToken(userId, "whatsapp");
  if (!token) return { platform: "whatsapp", success: false, error: "WhatsApp not connected" };

  const accessToken = token.accessToken;
  const phoneNumberId = token.platformUserId; // stored as WhatsApp phone number ID
  const recipientPhone = token.platformUsername; // stored as recipient phone number

  try {
    const res = await fetch(WA_API(phoneNumberId), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: recipientPhone,
        type: "text",
        text: { body: text.slice(0, 4096) },
      }),
    });
    const data = await res.json() as {
      messages?: Array<{ id: string }>;
      error?: { message?: string };
    };
    if (!res.ok || data.error) {
      throw new Error(data.error?.message ?? "WhatsApp API error");
    }
    const messageId = data.messages?.[0]?.id;
    return { platform: "whatsapp", success: true, postId: messageId };
  } catch (err) {
    return { platform: "whatsapp", success: false, error: err instanceof Error ? err.message : "Unknown error" };
  }
}
