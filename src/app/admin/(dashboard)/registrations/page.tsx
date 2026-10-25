
import type { Metadata } from "next";
import { connection } from "next/server";
import { Suspense } from "react";
import { Container } from "@/components/ui";
import { getContent } from "@/lib/content";
import { formatAnswer, type FormQuestion } from "@/lib/form-questions";
import { toRegistrationForm } from "@/lib/registration-form";
import { formatPhone, listRegistrations, type StoredRegistration } from "@/lib/registrations";
import { LoadingPanel, nairobiDate, PageHeader, Stats } from "../admin-ui";
import { Breakdown, LocationBreakdowns, QuestionBreakdowns, tally } from "../breakdown";

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
  const [rows, content] = await Promise.all([listRegistrations(), getContent()]);
  const form = toRegistrationForm(content);

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
        <Breakdown title="By role" items={tally(rows, form.roles, (r) => r.role)} />
        <Breakdown title="Access Hub services" items={tally(rows, form.hubServices, (r) => r.hubService)} />
        <LocationBreakdowns rows={rows} location={form.location} />
        <QuestionBreakdowns rows={rows} questions={form.questions} />
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
            <table className="w-full min-w-[1100px] border-collapse text-left text-[15px]">
              <thead>
                <tr className="border-b border-line text-[13px] tracking-[0.06em] text-muted uppercase">
                  <th className="py-3 pr-4 font-bold">Name</th>
                  <th className="py-3 pr-4 font-bold">Phone</th>
                  <th className="py-3 pr-4 font-bold">Role</th>
                  <th className="py-3 pr-4 font-bold">From</th>
                  <th className="py-3 pr-4 font-bold">Days</th>
                  <th className="py-3 pr-4 text-right font-bold">Group</th>
                  <th className="py-3 pr-4 font-bold">Access Hub</th>
                  <th className="py-3 pr-4 font-bold">Interests &amp; answers</th>
                  <th className="py-3 font-bold">Registered</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <Row key={r.phone} r={r} questions={form.questions} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );
}

function Row({ r, questions }: { r: StoredRegistration; questions: FormQuestion[] }) {
  const answers = questions.filter((q) => r.answers?.[q.id] !== undefined);
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
      <td className="py-3 pr-4">
        {r.role}
        {r.gender ? <span className="block text-sm text-muted">{r.gender}</span> : null}
      </td>
      <td className="py-3 pr-4">
        {r.subCounty || "—"}
        {r.ward || r.region ? <span className="block text-sm text-muted">{r.ward || r.region}</span> : null}
      </td>
      <td className="py-3 pr-4 whitespace-nowrap">
        {r.days.map((d) => (d === "day-1" ? "Day 1" : "Day 2")).join(", ")}
      </td>
      <td className="py-3 pr-4 text-right">{r.groupSize}</td>
      <td className="py-3 pr-4">{r.wantsHub ? `${r.hubService} · ${r.hubSlot}` : "—"}</td>
      <td className="max-w-[320px] py-3 pr-4 text-sm">
        {r.interests.length === 0 && answers.length === 0 ? "—" : null}
        {r.interests.length ? <span className="block">{r.interests.join(", ")}</span> : null}
        {answers.map((q) => (
          <span key={q.id} className="mt-1 block">
            <span className="text-muted">{q.label}:</span> {formatAnswer(r.answers?.[q.id])}
          </span>
        ))}
      </td>
      <td className="py-3 whitespace-nowrap text-muted">
        {nairobiDate(r.createdAt)}
      </td>
    </tr>
  );
}
