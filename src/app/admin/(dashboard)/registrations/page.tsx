import type { Metadata } from "next";
import { connection } from "next/server";
import { Suspense } from "react";
import { Container } from "@/components/ui";
import { hubServices, roles } from "@/lib/festival";
import { formatPhone, listRegistrations, type StoredRegistration } from "@/lib/registrations";
import { LoadingPanel, nairobiDate, PageHeader, Stats } from "../admin-ui";

export const metadata: Metadata = { title: "Registrations" };

export default function RegistrationsPage() {
  return (
    <>
      <PageHeader
        title="Registrations"
        description="Everyone who has planned their visit on the website."
        actions={
          <a
            href="/admin/registrations.csv"
            className="inline-flex min-h-11 items-center rounded-full bg-sun px-5 text-[15px] font-bold text-navy hover:brightness-105"
          >
            Download CSV
          </a>
        }
      />
      <Container className="flex flex-col gap-6">
        <Suspense fallback={<LoadingPanel label="Loading registrations…" />}>
          <Registrations />
        </Suspense>
      </Container>
    </>
  );
}

async function Registrations() {
  await connection();
  const rows = await listRegistrations();

  const people = (day?: "day-1" | "day-2") =>
    rows.filter((r) => !day || r.days.includes(day)).reduce((sum, r) => sum + r.groupSize, 0);
  const stats = [
    { label: "Registrations", value: rows.length },
    { label: "People in total", value: people() },
    { label: "Coming on Day 1", value: people("day-1") },
    { label: "Coming on Day 2", value: people("day-2") },
    { label: "Access Hub bookings", value: rows.filter((r) => r.wantsHub).length },
  ].map((s) => ({ ...s, value: s.value.toLocaleString("en-KE") }));

  return (
    <>
      <Stats items={stats} />

      <div className="grid gap-6 md:grid-cols-2">
        <Breakdown title="By role" items={roles.map((role) => [role, rows.filter((r) => r.role === role).length])} />
        <Breakdown
          title="Access Hub services"
          items={hubServices.map((s) => [s, rows.filter((r) => r.hubService === s).length])}
        />
      </div>

      <section aria-labelledby="list-title" className="rounded-3xl bg-white p-6 sm:p-8">
        <h2 id="list-title" className="text-[19px] font-bold">
          All registrations
        </h2>
        {rows.length === 0 ? (
          <p className="mt-3 text-muted">
            No one has registered yet. New registrations from the website appear here.
          </p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[860px] border-collapse text-left text-[15px]">
              <thead>
                <tr className="border-b border-line text-[13px] tracking-[0.06em] text-muted uppercase">
                  <th className="py-3 pr-4 font-bold">Name</th>
                  <th className="py-3 pr-4 font-bold">Phone</th>
                  <th className="py-3 pr-4 font-bold">Role</th>
                  <th className="py-3 pr-4 font-bold">Sub-county</th>
                  <th className="py-3 pr-4 font-bold">Days</th>
                  <th className="py-3 pr-4 text-right font-bold">Group</th>
                  <th className="py-3 pr-4 font-bold">Access Hub</th>
                  <th className="py-3 font-bold">Registered</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <Row key={r.phone} r={r} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );
}

function Row({ r }: { r: StoredRegistration }) {
  return (
    <tr className="border-b border-line align-top last:border-0">
      <td className="py-3 pr-4">
        <span className="font-semibold">{r.name}</span>
        {r.institution ? <span className="block text-sm text-muted">{r.institution}</span> : null}
        {r.email ? <span className="block text-sm text-muted">{r.email}</span> : null}
      </td>
      <td className="py-3 pr-4 whitespace-nowrap">
        <a href={`tel:+${r.phone}`} className="underline-offset-4 hover:underline">
          {formatPhone(r.phone)}
        </a>
      </td>
      <td className="py-3 pr-4">{r.role}</td>
      <td className="py-3 pr-4">{r.subCounty}</td>
      <td className="py-3 pr-4 whitespace-nowrap">
        {r.days.map((d) => (d === "day-1" ? "Day 1" : "Day 2")).join(", ")}
      </td>
      <td className="py-3 pr-4 text-right">{r.groupSize}</td>
      <td className="py-3 pr-4">{r.wantsHub ? `${r.hubService} · ${r.hubSlot}` : "—"}</td>
      <td className="py-3 whitespace-nowrap text-muted">
        {nairobiDate(r.createdAt)}
      </td>
    </tr>
  );
}

function Breakdown({ title, items }: { title: string; items: [string, number][] }) {
  return (
    <section className="rounded-3xl bg-white p-6 sm:p-8">
      <h2 className="text-[19px] font-bold">{title}</h2>
      <ul className="mt-3 flex flex-col">
        {items.map(([label, count]) => (
          <li key={label} className="flex justify-between gap-4 border-b border-line py-2.5 last:border-0">
            <span>{label}</span>
            <span className="font-bold text-navy tabular-nums">{count}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
