const TWITTER_MAX_LENGTH = 280;

export async function postToTwitter(
  content: string,
  accessToken: string
): Promise<{ success: true }> {
  const text =
    content.length > TWITTER_MAX_LENGTH
      ? content.slice(0, TWITTER_MAX_LENGTH - 3) + "..."
      : content;
  const res = await fetch("https://api.x.com/2/tweets", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ text }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(err || `Twitter API ${res.status}`);
  }
  return { success: true };
}
