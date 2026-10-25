import type { Metadata } from "next";
import { Suspense } from "react";
import { LogoMark } from "@/components/icons";
import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "Organisers sign in",
  robots: { index: false, follow: false },
};

export default function LoginPage() {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-navy px-4 py-12">
      <div className="flex w-full max-w-[420px] flex-col gap-7 rounded-3xl bg-white p-7 shadow-[0_20px_50px_rgba(0,0,0,0.3)] sm:p-10">
        <div className="flex flex-col gap-4">
          <span className="flex size-14 items-center justify-center rounded-2xl bg-navy">
            <LogoMark size={38} />
          </span>
          <div className="flex flex-col gap-1.5">
            <h1 className="font-display text-[32px] leading-tight font-extrabold tracking-[-0.02em] text-navy">
              Organisers sign in
            </h1>
            <p className="text-base text-muted">Manage registrations, pledges and the festival website.</p>
          </div>
        </div>
        <Suspense>
          <LoginForm />
        </Suspense>
      </div>
    </main>
  );
}
