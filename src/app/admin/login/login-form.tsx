"use client";

import { useSearchParams } from "next/navigation";
import { useActionState } from "react";
import { login, type LoginState } from "./actions";

const fieldClass =
  "min-h-12 w-full rounded-xl border-[1.5px] border-line-strong bg-white px-3.5 py-3 text-base text-ink focus:border-navy focus:outline-3 focus:outline-offset-1 focus:outline-sun";

export function LoginForm() {
  const [state, action, pending] = useActionState<LoginState, FormData>(login, {});
  const next = useSearchParams().get("next") ?? "/admin";

  return (
    <form action={action} className="flex flex-col gap-5">
      <input type="hidden" name="next" value={next} />
      {state.error ? (
        <p role="alert" className="rounded-xl border-2 border-rust bg-rust-soft px-4 py-3 font-semibold text-rust-ink">
          {state.error}
        </p>
      ) : null}
      <div className="flex flex-col gap-2">
        <label htmlFor="email" className="text-[15px] font-semibold">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="username"
          required
          defaultValue={state.email}
          className={fieldClass}
        />
      </div>
      <div className="flex flex-col gap-2">
        <label htmlFor="password" className="text-[15px] font-semibold">
          Password
        </label>
        <input id="password" name="password" type="password" autoComplete="current-password" required className={fieldClass} />
      </div>
      <button
        type="submit"
        disabled={pending}
        className="mt-1 inline-flex min-h-[52px] cursor-pointer items-center justify-center rounded-full bg-navy px-8 text-[17px] font-bold text-white transition-colors hover:bg-lake disabled:cursor-wait disabled:opacity-70"
      >
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
