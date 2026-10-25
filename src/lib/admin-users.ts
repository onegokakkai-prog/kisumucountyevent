import "server-only";
import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { getDb } from "./mongodb";
import { safeEqual } from "./admin-session";

// Organiser accounts live in the "admins" collection with scrypt-hashed passwords
// ("scrypt$<salt>$<hash>", base64). Add one with `npm run seed:admin -- <email> <password>`.
// Until an account exists, ADMIN_EMAIL / ADMIN_PASSWORD from the environment still work.

const scryptAsync = promisify(scrypt) as (password: string, salt: Buffer, keylen: number) => Promise<Buffer>;
const KEY_LENGTH = 64;

export type AdminUser = { email: string; passwordHash: string; createdAt: Date; updatedAt: Date };

export async function hashPassword(password: string) {
  const salt = randomBytes(16);
  const hash = await scryptAsync(password, salt, KEY_LENGTH);
  return `scrypt$${salt.toString("base64")}$${hash.toString("base64")}`;
}

async function verifyPassword(password: string, stored: string) {
  const [scheme, salt, hash] = stored.split("$");
  if (scheme !== "scrypt" || !salt || !hash) return false;
  const expected = Buffer.from(hash, "base64");
  const actual = await scryptAsync(password, Buffer.from(salt, "base64"), expected.length);
  return timingSafeEqual(actual, expected);
}

// A fixed hash to check against when the email is unknown, so a wrong email takes as long
// as a wrong password.
const decoy = hashPassword(randomBytes(16).toString("hex"));

export type CredentialCheck = "ok" | "wrong" | "not-configured";

export async function checkAdminCredentials(email: string, password: string): Promise<CredentialCheck> {
  const admins = getDb().collection<AdminUser>("admins");
  if ((await admins.estimatedDocumentCount()) > 0) {
    const user = await admins.findOne({ email });
    const ok = await verifyPassword(password, user?.passwordHash ?? (await decoy));
    return user && ok ? "ok" : "wrong";
  }

  const expectedEmail = (process.env.ADMIN_EMAIL ?? "").trim().toLowerCase();
  const expectedPassword = process.env.ADMIN_PASSWORD ?? "";
  if (!expectedEmail || !expectedPassword) return "not-configured";
  // Compare both so a wrong email takes as long as a wrong password.
  const emailOk = safeEqual(email, expectedEmail);
  const passwordOk = safeEqual(password, expectedPassword);
  return emailOk && passwordOk ? "ok" : "wrong";
}
