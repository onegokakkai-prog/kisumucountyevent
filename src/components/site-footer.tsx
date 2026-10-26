import Link from "next/link";
import { getContent } from "@/lib/content";
import { festival as festivalInfo } from "@/lib/festival";
import { FestivalBand } from "./festival-colors";

const festivalLinks = [
  { href: "/#about", label: "About" },
  { href: "/#tracks", label: "Tracks" },
  { href: "/#programme", label: "Programme" },
  { href: "/#brick", label: "Buy-a-Brick" },
  { href: "/#register", label: "Register" },
];

export async function SiteFooter() {
  const { festival } = await getContent();
  return (
    <footer className="bg-navy pb-10 text-white">
      <FestivalBand />
      <div className="mx-auto flex max-w-[1240px] flex-col gap-12 px-4 pt-16 sm:px-8 sm:pt-[72px]">
        <div className="flex flex-wrap justify-between gap-x-16 gap-y-10">
          <div className="flex max-w-[420px] flex-[1_1_320px] flex-col gap-4">
            <p className="font-display text-[28px] leading-[1.1] font-extrabold">
              {festival.name} {festivalInfo.year}
            </p>
            <p className="text-base leading-relaxed text-sky">
              {festival.dateLabel} · {festival.venue}, {festivalInfo.location}
            </p>
            <Link
              href="/#register"
              className="self-start rounded-full bg-sun px-6 py-3.5 text-base font-bold text-navy transition-colors hover:brightness-105"
            >
              Registration
            </Link>
          </div>
          <nav aria-label="Footer" className="flex flex-col">
            <h2 className="mb-2 text-[13px] font-bold tracking-[0.06em] text-sun uppercase">Festival</h2>
            {festivalLinks.map((l) => (
              <a key={l.href} href={l.href} className="text-[15px] leading-[2.1] text-sky hover:text-white">
                {l.label}
              </a>
            ))}
          </nav>
          <div className="flex flex-col">
            <h2 className="mb-2 text-[13px] font-bold tracking-[0.06em] text-sun uppercase">Contact</h2>
            <a href={`tel:${festival.phone}`} className="text-[15px] leading-[2.1] text-sky hover:text-white">
              {festival.phoneLabel}
            </a>
            <a
              href={`https://wa.me/${festival.phone.replace("+", "")}`}
              className="text-[15px] leading-[2.1] text-sky hover:text-white"
            >
              WhatsApp the festival team
            </a>
          </div>
        </div>
        <p className="border-t border-[#23415f] pt-6 text-sm text-[#a9bccd]">
          © {festivalInfo.year} County Government of Kisumu · County Education Board · Mary J Oasis for Education · Jowi
          98.1 FM
        </p>
      </div>
    </footer>
  );
}
