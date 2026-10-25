// Signed admin session tokens. Uses Web Crypto so the same code runs in the proxy and in
// server actions. A token is "<expiry ms>.<HMAC-SHA256 of the expiry>", base64url-encoded.

export const SESSION_COOKIE = "admin_session";
export const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days, in seconds

const encoder = new TextEncoder();

function secret() {
  // A dedicated secret is best; falling back to the password still ties sessions to it,
  // so changing the password signs everyone out.
  const value = process.env.ADMIN_SESSION_SECRET || process.env.ADMIN_PASSWORD;
  if (!value) throw new Error("ADMIN_SESSION_SECRET (or ADMIN_PASSWORD) is not set.");
  return value;
}

function toBase64Url(bytes: ArrayBuffer) {
  return btoa(String.fromCharCode(...new Uint8Array(bytes)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

async function sign(payload: string) {
  const key = await crypto.subtle.importKey("raw", encoder.encode(secret()), { name: "HMAC", hash: "SHA-256" }, false, [
    "sign",
  ]);
  return toBase64Url(await crypto.subtle.sign("HMAC", key, encoder.encode(payload)));
}

export function safeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export async function createSessionToken() {
  const expires = String(Date.now() + SESSION_MAX_AGE * 1000);
  return `${expires}.${await sign(expires)}`;
}

export async function verifySessionToken(token: string | undefined) {
  if (!token) return false;
  const [expires, signature] = token.split(".");
  if (!expires || !signature || Number(expires) < Date.now()) return false;
  try {
    return safeEqual(signature, await sign(expires));
  } catch {
    return false;
  }
}
