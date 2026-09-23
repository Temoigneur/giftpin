import crypto from "node:crypto";

/**
 * Two distinct keys, on purpose:
 *
 *   ENCRYPTION_KEY — AES-256-GCM for data at rest (access tokens, registrant
 *                    emails, shipping addresses). Losing it loses the data.
 *   SIGNING_KEY    — HMAC-SHA256 for tokens we hand out (cart attribution,
 *                    magic links, image proxy URLs). Rotating it just
 *                    invalidates outstanding tokens.
 */

function requiredKey(name: "ENCRYPTION_KEY" | "SIGNING_KEY"): Buffer {
  const raw = process.env[name];
  if (!raw) {
    // Tests and `prisma generate` don't need real keys; anything that reaches
    // this in a request path should fail loudly rather than silently use zeros.
    if (process.env.NODE_ENV === "test") {
      return Buffer.alloc(32, name === "ENCRYPTION_KEY" ? 1 : 2);
    }
    throw new Error(
      `${name} is not set. Generate one with: node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"`,
    );
  }
  const key = Buffer.from(raw, "base64");
  if (key.length !== 32) {
    throw new Error(`${name} must be exactly 32 bytes, base64 encoded (got ${key.length})`);
  }
  return key;
}

// ---------------------------------------------------------------------------
// AES-256-GCM
// ---------------------------------------------------------------------------

const IV_BYTES = 12;

/** Returns `v1.<iv>.<tag>.<ciphertext>`, all base64url. */
export function encrypt(plaintext: string): string {
  const iv = crypto.randomBytes(IV_BYTES);
  const cipher = crypto.createCipheriv("aes-256-gcm", requiredKey("ENCRYPTION_KEY"), iv);
  const ciphertext = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return [
    "v1",
    iv.toString("base64url"),
    tag.toString("base64url"),
    ciphertext.toString("base64url"),
  ].join(".");
}

export function decrypt(payload: string): string {
  const [version, ivB64, tagB64, ctB64] = payload.split(".");
  if (version !== "v1" || !ivB64 || !tagB64 || !ctB64) {
    throw new Error("Malformed ciphertext");
  }
  const decipher = crypto.createDecipheriv(
    "aes-256-gcm",
    requiredKey("ENCRYPTION_KEY"),
    Buffer.from(ivB64, "base64url"),
  );
  decipher.setAuthTag(Buffer.from(tagB64, "base64url"));
  return Buffer.concat([
    decipher.update(Buffer.from(ctB64, "base64url")),
    decipher.final(),
  ]).toString("utf8");
}

/** Decrypt without throwing — for rendering paths where a bad row shouldn't 500. */
export function tryDecrypt(payload: string | null | undefined): string | null {
  if (!payload) return null;
  try {
    return decrypt(payload);
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Deterministic hashing — lets us look up by email without decrypting
// ---------------------------------------------------------------------------

export function blindIndex(value: string): string {
  return crypto
    .createHmac("sha256", requiredKey("SIGNING_KEY"))
    .update(`bi:${value.trim().toLowerCase()}`)
    .digest("base64url");
}

export function sha256(value: string): string {
  return crypto.createHash("sha256").update(value).digest("hex");
}

// ---------------------------------------------------------------------------
// Signed tokens
//
// Format: <base64url(json)>.<base64url(hmac)>
//
// Not JWT. We control both ends, the payloads are tiny, and a JWT's `alg`
// header is a footgun we get nothing for.
// ---------------------------------------------------------------------------

export interface TokenPayload {
  /** Purpose. A token minted for one purpose must never verify for another. */
  p: string;
  /** Expiry, epoch seconds. Omit for tokens that never expire (cart tokens). */
  e?: number;
  [key: string]: unknown;
}

function hmac(input: string): string {
  return crypto
    .createHmac("sha256", requiredKey("SIGNING_KEY"))
    .update(input)
    .digest("base64url");
}

export function signToken(payload: TokenPayload, ttlSeconds?: number): string {
  const body: TokenPayload = { ...payload };
  if (ttlSeconds !== undefined) {
    body.e = Math.floor(Date.now() / 1000) + ttlSeconds;
  }
  const encoded = Buffer.from(JSON.stringify(body), "utf8").toString("base64url");
  return `${encoded}.${hmac(encoded)}`;
}

/**
 * Verifies signature, purpose and expiry. Returns null on any failure —
 * callers must treat null as "unauthenticated", never as "empty payload".
 */
export function verifyToken<T extends TokenPayload = TokenPayload>(
  token: string | null | undefined,
  expectedPurpose: string,
): T | null {
  if (!token) return null;
  const dot = token.lastIndexOf(".");
  if (dot <= 0) return null;

  const encoded = token.slice(0, dot);
  const provided = token.slice(dot + 1);
  const expected = hmac(encoded);

  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;

  let payload: T;
  try {
    payload = JSON.parse(Buffer.from(encoded, "base64url").toString("utf8"));
  } catch {
    return null;
  }

  if (payload.p !== expectedPurpose) return null;
  if (payload.e !== undefined && payload.e < Math.floor(Date.now() / 1000)) return null;

  return payload;
}

// ---------------------------------------------------------------------------
// Misc
// ---------------------------------------------------------------------------

/** URL-safe, unguessable, no lookalike characters. Used for registry slugs. */
export function randomSlug(length = 12): string {
  const alphabet = "abcdefghjkmnpqrstuvwxyz23456789";
  const bytes = crypto.randomBytes(length);
  let out = "";
  for (let i = 0; i < length; i++) out += alphabet[bytes[i] % alphabet.length];
  return out;
}

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16);
  const derived = crypto.scryptSync(password, salt, 64);
  return `scrypt:${salt.toString("base64url")}:${derived.toString("base64url")}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [scheme, saltB64, hashB64] = stored.split(":");
  if (scheme !== "scrypt" || !saltB64 || !hashB64) return false;
  const expected = Buffer.from(hashB64, "base64url");
  const derived = crypto.scryptSync(password, Buffer.from(saltB64, "base64url"), expected.length);
  return expected.length === derived.length && crypto.timingSafeEqual(expected, derived);
}
