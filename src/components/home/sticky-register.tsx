"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Icon, LogoMark } from "../icons";

// Keeps the register button in reach once the hero (and its CTA) has scrolled away.
export function StickyRegister({ name, year, dateLabel, venue }: { name: string; year: number; dateLabel: string; venue: string }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const hero = document.querySelector("[data-hero]");
    if (!hero) return;
    const observer = new IntersectionObserver(([entry]) => setVisible(!entry.isIntersecting));
    observer.observe(hero);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      inert={!visible}
      className={`fixed inset-x-0 top-0 z-40 bg-navy/95 text-white shadow-[0_8px_30px_rgba(11,36,64,0.25)] backdrop-blur transition-transform duration-200 ease-out motion-reduce:transition-none ${
        visible ? "translate-y-0" : "-translate-y-full"
      }`}
    >
      <div className="mx-auto flex max-w-[1240px] items-center justify-between gap-4 px-4 py-2.5 sm:px-8">
        <Link href="/" className="flex min-h-11 min-w-0 items-center gap-2.5 text-white no-underline">
          <LogoMark size={36} />
          <span className="flex min-w-0 flex-col leading-[1.15]">
            <span className="truncate font-display text-[15px] font-extrabold sm:text-base">
              {name} {year}
            </span>
            <span className="truncate text-[13px] text-sky">
              {dateLabel} · {venue}
            </span>
          </span>
        </Link>
        <Link
          href="/#register"
          className="inline-flex min-h-11 flex-none items-center gap-2 rounded-full bg-sun px-5 text-[15px] font-bold text-navy transition-colors duration-150 hover:brightness-105"
        >
          Registration
          <Icon name="arrow-right" size={16} strokeWidth={2.4} />
        </Link>
      </div>
    </div>
  );
}
