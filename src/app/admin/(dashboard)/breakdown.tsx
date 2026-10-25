import { choiceTypes, tallyAnswers, type Answers, type FormQuestion } from "@/lib/form-questions";
import type { Location, LocationConfig } from "@/lib/registration-form";

// Count cards for the registrations and professionals pages.

export function Breakdown({ title, items, wide = false }: { title: string; items: [string, number][]; wide?: boolean }) {
  return (
    <section className={`rounded-3xl bg-white p-6 sm:p-8 ${wide ? "md:col-span-2" : ""}`}>
      <h2 className="text-[19px] font-bold">{title}</h2>
      <ul className={`mt-3 ${wide ? "gap-x-10 md:columns-2" : ""}`}>
        {items.map(([label, count]) => (
          <li key={label} className="flex break-inside-avoid justify-between gap-4 border-b border-line py-2.5 last:border-0">
            <span>{label}</span>
            <span className="font-bold text-navy tabular-nums">{count}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

// Choices on the form now, plus any older answers that are no longer offered.
export function tally<T>(rows: T[], choices: string[], pick: (r: T) => string | undefined): [string, number][] {
  const labels = [...choices, ...rows.map(pick).filter((v): v is string => !!v && !choices.includes(v))];
  return [...new Set(labels)].map((label) => [label, rows.filter((r) => pick(r) === label).length]);
}

type Located = Partial<Location>;

export function LocationBreakdowns({ rows, location }: { rows: Located[]; location: LocationConfig }) {
  const wards = Object.entries(location.wards).flatMap(([subCounty, list]) => list.map((ward) => `${subCounty} · ${ward}`));
  return (
    <>
      <Breakdown title="By gender" items={tally(rows, location.genders, (r) => r.gender)} />
      <Breakdown title="By sub-county" items={tally(rows, location.subCounties, (r) => r.subCounty)} />
      <Breakdown title="By ward" wide items={tally(rows, wards, (r) => (r.ward ? `${r.subCounty} · ${r.ward}` : undefined))} />
      <Breakdown title="From outside Kisumu County" items={tally(rows, location.regions, (r) => r.region)} />
    </>
  );
}

// One card per choice question; grouped choices (like CBC tracks) also get a card of group totals.
export function QuestionBreakdowns({ rows, questions }: { rows: { answers?: Answers }[]; questions: FormQuestion[] }) {
  return questions
    .filter((q) => choiceTypes.includes(q.type) || q.type === "yesno")
    .flatMap((q) => {
      const { choices, groups } = tallyAnswers(
        q,
        rows.map((r) => r.answers?.[q.id]),
      );
      const cards = [<Breakdown key={q.id} title={q.label} items={choices} wide={choices.length > 8} />];
      if (groups.length) cards.unshift(<Breakdown key={`${q.id}-groups`} title={`${q.label}: by group`} items={groups} />);
      return cards;
    });
}
