"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { SESSION_COOKIE, SESSION_MAX_AGE, createSessionToken } from "@/lib/admin-session";
import { checkAdminCredentials } from "@/lib/admin-users";
import { clearFailures, lockedMinutes, recordFailure } from "@/lib/login-throttle";

export type LoginState = { error?: string; email?: string };

// Only same-site admin paths, so the login page can't be used to bounce people elsewhere.
function safeNext(value: FormDataEntryValue | null) {
  return typeof value === "string" && value.startsWith("/admin") && !value.startsWith("//") ? value : "/admin";
}

// The visitor's IP as reported by the hosting proxy (Vercel sets x-forwarded-for).
async function clientKey() {
  const h = await headers();
  return h.get("x-forwarded-for")?.split(",")[0].trim() || h.get("x-real-ip") || "unknown";
}

export async function login(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const key = await clientKey();
  const locked = await lockedMinutes(key);
  if (locked) {
    return { error: `Too many wrong attempts. Try again in ${locked} minute${locked === 1 ? "" : "s"}.`, email };
  }

  let result;
  try {
    result = await checkAdminCredentials(email, password);
  } catch (err) {
    console.error("Admin sign-in check failed", err);
    return { error: "Couldn't sign in just now. Please try again.", email };
  }
  if (result === "not-configured") {
    return { error: "Admin sign-in isn't set up yet. Run npm run seed:admin to create an account.", email };
  }
  if (result === "wrong") {
    await recordFailure(key);
    await new Promise((r) => setTimeout(r, 600));
    return { error: "That email and password don't match.", email };
  }

  await clearFailures(key);

  (await cookies()).set(SESSION_COOKIE, await createSessionToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
  redirect(safeNext(formData.get("next")));
}

export async function logout() {
  (await cookies()).delete(SESSION_COOKIE);
  redirect("/admin/login");
}
