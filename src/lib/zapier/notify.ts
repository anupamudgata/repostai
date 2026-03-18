/**
 * Sends repurpose result to user's Zapier webhook URL (Webhooks by Zapier — Catch Hook).
 * Fire-and-forget; does not throw. Call after repurpose completes.
 */
export function notifyZapier(
  webhookUrl: string | null | undefined,
  payload: {
    jobId: string;
    outputs: Array<{ platform: string; content: string }>;
    createdAt: string;
    sourceUrl?: string;
  }
): void {
  if (!webhookUrl || typeof webhookUrl !== "string" || !webhookUrl.startsWith("https://")) {
    return;
  }
  fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  }).catch((err) => {
    console.error("[zapier] Webhook delivery failed:", err?.message ?? err);
  });
}
