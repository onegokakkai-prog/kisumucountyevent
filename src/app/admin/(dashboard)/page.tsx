import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";
import { Icon } from "@/components/icons";
import { Container } from "@/components/ui";
import { getContent } from "@/lib/content";
import { listPledges } from "@/lib/pledges";
import { listRegistrations } from "@/lib/registrations";
import { kes, LoadingPanel, PageHeader, Stats } from "./admin-ui";

export const metadata: Metadata = { title: "Overview" };

const shortcuts = [
  { href: "/admin/registrations", title: "Registrations", text: "See who's planned their visit and download the list." },
  { href: "/admin/pledges", title: "Pledges", text: "Track Buy-a-Brick pledges and mark money as received." },
  { href: "/admin/content", title: "Site content", text: "Change colours, wording, photos and the voiceover." },
];

export default function OverviewPage() {
  return (
    <>
      <PageHeader title="Overview" description="How registrations and the Buy-a-Brick drive are going." />
      <Container className="flex flex-col gap-6">
        <Suspense fallback={<LoadingPanel label="Loading numbers…" />}>
          <Numbers />
        </Suspense>
        <ul className="grid gap-4 md:grid-cols-3">
          {shortcuts.map((s) => (
            <li key={s.href}>
              <Link
                href={s.href}
                className="group flex h-full flex-col gap-2 rounded-3xl border border-line bg-white p-6 transition-colors hover:border-navy"
              >
                <span className="flex items-center justify-between text-lg font-bold text-navy">
                  {s.title}
                  <Icon name="arrow-right" size={18} strokeWidth={2.4} className="transition-transform group-hover:translate-x-0.5" />
                </span>
                <span className="text-[15px] text-muted">{s.text}</span>
              </Link>
            </li>
          ))}
        </ul>
      </Container>
    </>
  );
}

async function Numbers() {
  await connection();
  const [registrations, pledges, content] = await Promise.all([listRegistrations(), listPledges(), getContent()]);
  const received = pledges.filter((p) => p.status === "received").reduce((sum, p) => sum + p.amount, 0);
  const pledged = pledges.reduce((sum, p) => sum + p.amount, 0);

  return (
    <Stats
      items={[
        { label: "Registrations", value: registrations.length.toLocaleString("en-KE") },
        { label: "People coming", value: registrations.reduce((sum, r) => sum + r.groupSize, 0).toLocaleString("en-KE") },
        { label: "Pledges", value: pledges.length.toLocaleString("en-KE") },
        { label: "Total pledged", value: kes.format(pledged) },
        { label: "Raised so far", value: kes.format(received + content.brick.raisedOffline) },
      ]}
    />
  );
}
