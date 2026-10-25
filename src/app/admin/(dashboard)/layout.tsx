import type { Metadata } from "next";
import Link from "next/link";
import { LogoMark } from "@/components/icons";
import { Container } from "@/components/ui";
import { logout } from "../login/actions";
import { AdminNav } from "./admin-nav";

export const metadata: Metadata = {
  title: { default: "Organisers", template: "%s · Organisers" },
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return (
    <div className="min-h-dvh bg-mist">
      <header className="bg-navy text-white">
        <Container className="flex flex-col gap-3 py-4">
          <div className="flex items-center justify-between gap-4">
            <Link href="/admin" className="flex min-h-11 items-center gap-3 text-white">
              <LogoMark size={36} />
              <span className="flex flex-col leading-[1.1]">
                <span className="font-display text-[17px] font-extrabold">Festival admin</span>
                <span className="text-[13px] text-sky">Organisers only</span>
              </span>
            </Link>
            <div className="flex items-center gap-2">
              <a
                href="/"
                target="_blank"
                rel="noreferrer"
                className="hidden min-h-11 items-center rounded-full px-4 text-[15px] font-semibold text-white/85 hover:bg-white/10 hover:text-white sm:inline-flex"
              >
                View site
              </a>
              <form action={logout}>
                <button
                  type="submit"
                  className="inline-flex min-h-11 cursor-pointer items-center rounded-full border border-white/30 px-4 text-[15px] font-semibold hover:bg-white/10"
                >
                  Sign out
                </button>
              </form>
            </div>
          </div>
          <AdminNav />
        </Container>
      </header>
      <main className="pb-24">{children}</main>
    </div>
  );
}
