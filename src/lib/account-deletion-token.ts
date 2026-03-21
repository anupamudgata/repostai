import { createHmac, timingSafeEqual, randomBytes } from "node:crypto";

const MAX_AGE_SEC = 60 * 60 * 48; // 48h

export type AccountDeletionTokenPayload = {
  sub: string;
  email: string;
  iat: number;
  exp: number;
  jti: string;
};

function getSecret(): string {
  const s =
    process.env.ACCOUNT_DELETION_TOKEN_SECRET ||
    process.env.CRON_SECRET ||
    process.env.ENCRYPTION_SECRET;
  if (!s || s.length < 16) {
    throw new Error(
      "Set ACCOUNT_DELETION_TOKEN_SECRET (or CRON_SECRET / ENCRYPTION_SECRET) for account deletion links."
    );
  }
  return s;
}

function encodePayload(p: AccountDeletionTokenPayload): string {
  return Buffer.from(JSON.stringify(p), "utf8").toString("base64url");
}

function decodePayload(raw: string): AccountDeletionTokenPayload | null {
  try {
    const json = Buffer.from(raw, "base64url").toString("utf8");
    const p = JSON.parse(json) as AccountDeletionTokenPayload;
    if (
      typeof p.sub !== "string" ||
      typeof p.email !== "string" ||
      typeof p.exp !== "number" ||
      typeof p.jti !== "string"
    ) {
      return null;
    }
    return p;
  } catch {
    return null;
  }
}

export function signAccountDeletionToken(userId: string, email: string): string {
  const now = Math.floor(Date.now() / 1000);
  const payload: AccountDeletionTokenPayload = {
    sub: userId,
    email,
    iat: now,
    exp: now + MAX_AGE_SEC,
    jti: randomBytes(16).toString("hex"),
  };
  const body = encodePayload(payload);
  const sig = createHmac("sha256", getSecret()).update(body).digest("base64url");
  return `${body}.${sig}`;
}

export function verifyAccountDeletionToken(
  token: string
): { userId: string; email: string } | null {
  const parts = token.split(".");
  if (parts.length !== 2) return null;
  const [body, sig] = parts;
  if (!body || !sig) return null;
  const expected = createHmac("sha256", getSecret()).update(body).digest("base64url");
  const a = Buffer.from(sig, "utf8");
  const b = Buffer.from(expected, "utf8");
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  const payload = decodePayload(body);
  if (!payload) return null;
  const now = Math.floor(Date.now() / 1000);
  if (payload.exp < now) return null;
  return { userId: payload.sub, email: payload.email };
}
