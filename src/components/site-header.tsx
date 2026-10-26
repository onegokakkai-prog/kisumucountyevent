"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { festival, navLinks } from "@/lib/festival";
import { Icon, LogoMark } from "./icons";

export function SiteHeader({ name, variant = "full" }: { name: string; variant?: "full" | "compact" }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <nav aria-label="Main" className="relative mx-auto max-w-[1240px] px-4 py-4 sm:px-8 sm:py-5">
      <div className="flex items-center justify-between gap-4">
        <Link href="/" className="flex min-h-11 items-center gap-3 text-white no-underline">
          <LogoMark />
          <span className="flex flex-col leading-[1.1]">
            <span className="font-display text-[17px] font-extrabold tracking-[-0.01em] sm:text-[19px]">
              {name}
            </span>
            <span className="text-[13px] font-medium text-sky">
              {festival.edition} · {festival.year}
            </span>
          </span>
        </Link>

        {variant === "full" ? (
          <>
            <div className="hidden items-center gap-x-6 lg:flex">
              {navLinks.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  className="py-3 text-[15px] font-medium text-white/90 underline-offset-[6px] hover:text-white hover:underline"
                >
                  {l.label}
                </a>
              ))}
              <Link
                href="/#register"
                className="inline-flex min-h-11 items-center rounded-full bg-sun px-[22px] text-[15px] font-bold text-navy transition-colors hover:brightness-105"
              >
                Registration
              </Link>
            </div>
            <button
              type="button"
              aria-expanded={open}
              aria-controls="mobile-menu"
              aria-label={open ? "Close menu" : "Open menu"}
              onClick={() => setOpen((o) => !o)}
              className="flex size-12 items-center justify-center rounded-xl border-[1.5px] border-white/40 text-white lg:hidden"
            >
              <Icon name={open ? "close" : "menu"} size={22} strokeWidth={2.2} />
            </button>
          </>
        ) : (
          <Link href="/" className="py-3 text-[15px] font-semibold text-white underline-offset-4 hover:underline">
            <span aria-hidden="true">← </span>Back<span className="max-sm:sr-only"> to festival home</span>
          </Link>
        )}
      </div>

      {variant === "full" && open ? (
        <div
          id="mobile-menu"
          className="absolute inset-x-4 top-full z-20 mt-1 rounded-2xl bg-white p-3 shadow-[0_20px_50px_rgba(11,36,64,0.25)] sm:inset-x-8 lg:hidden"
        >
          <ul className="flex flex-col">
            {navLinks.map((l) => (
              <li key={l.href}>
                <a
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="flex min-h-12 items-center rounded-xl px-4 text-[17px] font-semibold text-navy hover:bg-mist"
                >
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
          <Link
            href="/#register"
            onClick={() => setOpen(false)}
            className="mt-2 flex min-h-[52px] items-center justify-center rounded-full bg-sun text-[17px] font-extrabold text-navy"
          >
            Registration
          </Link>
        </div>
      ) : null}
    </nav>
  );
}
