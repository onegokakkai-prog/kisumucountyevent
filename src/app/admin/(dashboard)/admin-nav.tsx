"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/registrations", label: "Registrations" },
  { href: "/admin/pledges", label: "Pledges" },
  { href: "/admin/content", label: "Site content" },
];

export function AdminNav() {
  const pathname = usePathname();
  return (
    <nav aria-label="Admin" className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
      <ul className="flex gap-1">
        {links.map((l) => {
          const active = l.href === "/admin" ? pathname === "/admin" : pathname.startsWith(l.href);
          return (
            <li key={l.href}>
              <Link
                href={l.href}
                aria-current={active ? "page" : undefined}
                className="inline-flex min-h-11 items-center rounded-full px-4 text-[15px] font-semibold whitespace-nowrap text-white/80 transition-colors hover:bg-white/10 hover:text-white aria-[current=page]:bg-white aria-[current=page]:text-navy"
              >
                {l.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
