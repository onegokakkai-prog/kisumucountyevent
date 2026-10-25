import type { Metadata } from "next";
import { connection } from "next/server";
import { Suspense } from "react";
import { Container } from "@/components/ui";
import { getContent } from "@/lib/content";
import { formatAnswer, type FormQuestion } from "@/lib/form-questions";
import { listProfessionals, type StoredProfessional } from "@/lib/professionals";
import { formatPhone } from "@/lib/registrations";
import { toProfessionalForm } from "@/lib/registration-form";
import { LoadingPanel, nairobiDate, PageHeader, Stats } from "../admin-ui";
import { LocationBreakdowns, QuestionBreakdowns } from "../breakdown";

export const metadata: Metadata = { title: "Professionals" };

export default function ProfessionalsPage() {
  return (
    <>
      <PageHeader
        title="Professionals"
        description="Professionals who've offered to sponsor, volunteer or support the festival. Share /professionals to invite more."
        actions={
          <a
            href="/admin/professionals.csv"
            className="inline-flex min-h-11 items-center rounded-full bg-sun px-5 text-[15px] font-bold text-navy hover:brightness-105"
          >
            Download CSV
          </a>
        }
      />
      <Container className="flex flex-col gap-6">
        <Suspense fallback={<LoadingPanel label="Loading professionals…" />}>
          <Professionals />
        </Suspense>
      </Container>
    </>
  );
}

// Answers to "Tick all that apply" questions about sponsorship count as sponsorship offers.
function offersSponsorship(r: StoredProfessional, questions: FormQuestion[]) {
  return questions.some((q) => {
    const answer = r.answers[q.id];
    return (Array.isArray(answer) ? answer : answer ? [answer] : []).some((a) => /sponsor|contribut|fund/i.test(a));
  });
}

async function Professionals() {
  await connection();
  const [rows, content] = await Promise.all([listProfessionals(), getContent()]);
  const form = toProfessionalForm(content);
  const participation = form.questions.filter((q) => q.id === "participation");
  const volunteer = form.questions.find((q) => q.type === "yesno");

  const stats = [
    { label: "Professionals", value: rows.length },
    { label: "Offering sponsorship", value: rows.filter((r) => offersSponsorship(r, participation)).length },
    ...(volunteer ? [{ label: "Can volunteer", value: rows.filter((r) => r.answers[volunteer.id] === "Yes").length }] : []),
    { label: "From Kisumu County", value: rows.filter((r) => r.ward).length },
  ].map((s) => ({ ...s, value: s.value.toLocaleString("en-KE") }));

  return (
    <>
      <Stats items={stats} />

      <div className="grid gap-6 md:grid-cols-2">
        <QuestionBreakdowns rows={rows} questions={form.questions} />
        <LocationBreakdowns rows={rows} location={form.location} />
      </div>

      <section aria-labelledby="list-title" className="rounded-3xl bg-white p-6 sm:p-8">
        <h2 id="list-title" className="text-[19px] font-bold">
          Everyone
        </h2>
        {rows.length === 0 ? (
          <p className="mt-3 text-muted">No professionals yet. Their details appear here when they send the form.</p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[960px] border-collapse text-left text-[15px]">
              <thead>
                <tr className="border-b border-line text-[13px] tracking-[0.06em] text-muted uppercase">
                  <th className="py-3 pr-4 font-bold">Name</th>
                  <th className="py-3 pr-4 font-bold">Phone</th>
                  <th className="py-3 pr-4 font-bold">From</th>
                  <th className="py-3 pr-4 font-bold">Answers</th>
                  <th className="py-3 font-bold">Sent</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.phone} className="border-b border-line align-top last:border-0">
                    <td className="py-3 pr-4">
                      <span className="font-semibold">{r.name}</span>
                      {r.gender ? <span className="block text-sm text-muted">{r.gender}</span> : null}
                      {r.email ? <span className="block text-sm text-muted">{r.email}</span> : null}
                    </td>
                    <td className="py-3 pr-4 whitespace-nowrap">
                      <a href={`tel:+${r.phone}`} className="underline-offset-4 hover:underline">
                        {formatPhone(r.phone)}
                      </a>
                    </td>
                    <td className="py-3 pr-4">
                      {r.subCounty}
                      {r.ward || r.region ? <span className="block text-sm text-muted">{r.ward || r.region}</span> : null}
                    </td>
                    <td className="max-w-[480px] py-3 pr-4 text-sm">
                      {form.questions
                        .filter((q) => r.answers[q.id] !== undefined)
                        .map((q) => (
                          <span key={q.id} className="mb-1.5 block">
                            <span className="text-muted">{q.label}:</span> {formatAnswer(r.answers[q.id])}
                          </span>
                        ))}
                    </td>
                    <td className="py-3 whitespace-nowrap text-muted">{nairobiDate(r.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );
}
