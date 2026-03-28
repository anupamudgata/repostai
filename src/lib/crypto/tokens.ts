import { createCipheriv, createDecipheriv, randomBytes, scrypt } from "node:crypto";

const ALGORITHM = "aes-256-gcm";
const KEY_LEN = 32;
const IV_LEN = 16;
const AUTH_TAG_LEN = 16;
const SALT_LEN = 16;

/** Legacy salt used before per-token salt was added. Needed for backward-compat decryption. */
const LEGACY_SALT = "repostai-tokens";

function getSecret(): string {
  const secret = process.env.ENCRYPTION_SECRET;
  if (!secret || secret.length < 16) {
    throw new Error("ENCRYPTION_SECRET must be set and at least 16 characters");
  }
  return secret;
}

function deriveKeyAsync(secret: string, salt: Buffer | string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    scrypt(secret, salt, KEY_LEN, (err, key) => {
      if (err) reject(err);
      else resolve(key);
    });
  });
}

/** Synchronous key derivation — only for backward-compat decrypt of legacy tokens. */
function deriveKeySync(secret: string, salt: string): Buffer {
  const { scryptSync } = require("node:crypto");
  return scryptSync(secret, salt, KEY_LEN);
}

/**
 * Encrypt a plaintext string (e.g. OAuth access token) for storage.
 * Format: hex-encoded salt(16) + iv(16) + authTag(16) + ciphertext.
 * Distinguishable from legacy format by being longer (extra 16 bytes of salt).
 */
export async function encryptAsync(plaintext: string): Promise<string> {
  const secret = getSecret();
  const salt = randomBytes(SALT_LEN);
  const key = await deriveKeyAsync(secret, salt);
  const iv = randomBytes(IV_LEN);
  const cipher = createCipheriv(ALGORITHM, key, iv);
  const encrypted = Buffer.concat([
    cipher.update(plaintext, "utf8"),
    cipher.final(),
  ]);
  const authTag = cipher.getAuthTag();
  return Buffer.concat([salt, iv, authTag, encrypted]).toString("hex");
}

/**
 * Synchronous encrypt — for contexts where async isn't possible.
 * Uses per-token random salt (new format).
 */
export function encrypt(plaintext: string): string {
  const secret = getSecret();
  const salt = randomBytes(SALT_LEN);
  const key = deriveKeySync(secret, salt.toString("hex"));
  const iv = randomBytes(IV_LEN);
  const cipher = createCipheriv(ALGORITHM, key, iv);
  const encrypted = Buffer.concat([
    cipher.update(plaintext, "utf8"),
    cipher.final(),
  ]);
  const authTag = cipher.getAuthTag();
  return Buffer.concat([salt, iv, authTag, encrypted]).toString("hex");
}

/**
 * Decrypt a value produced by encrypt() or encryptAsync().
 * Auto-detects legacy format (no salt prefix) vs new format (with salt prefix)
 * by trying new format first, falling back to legacy.
 */
export function decrypt(ciphertextHex: string): string {
  const secret = getSecret();
  const buf = Buffer.from(ciphertextHex, "hex");

  // Try new format first: salt(16) + iv(16) + authTag(16) + ciphertext = minimum 48 bytes
  if (buf.length >= SALT_LEN + IV_LEN + AUTH_TAG_LEN) {
    try {
      const salt = buf.subarray(0, SALT_LEN);
      const iv = buf.subarray(SALT_LEN, SALT_LEN + IV_LEN);
      const authTag = buf.subarray(SALT_LEN + IV_LEN, SALT_LEN + IV_LEN + AUTH_TAG_LEN);
      const encrypted = buf.subarray(SALT_LEN + IV_LEN + AUTH_TAG_LEN);
      const key = deriveKeySync(secret, salt.toString("hex"));
      const decipher = createDecipheriv(ALGORITHM, key, iv);
      decipher.setAuthTag(authTag);
      return decipher.update(encrypted) + decipher.final("utf8");
    } catch {
      // Fall through to legacy format
    }
  }

  // Legacy format: iv(16) + authTag(16) + ciphertext (no salt prefix)
  if (buf.length < IV_LEN + AUTH_TAG_LEN) {
    throw new Error("Invalid ciphertext");
  }
  const iv = buf.subarray(0, IV_LEN);
  const authTag = buf.subarray(IV_LEN, IV_LEN + AUTH_TAG_LEN);
  const encrypted = buf.subarray(IV_LEN + AUTH_TAG_LEN);
  const key = deriveKeySync(secret, LEGACY_SALT);
  const decipher = createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);
  return decipher.update(encrypted) + decipher.final("utf8");
}
