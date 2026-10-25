import type { Metadata } from "next";
import { Suspense } from "react";
import { Container } from "@/components/ui";
import { getContent } from "@/lib/content";
import { LoadingPanel, PageHeader } from "../admin-ui";
import { formSections, proSections, type SectionConfig } from "../content/fields";
import { SectionForm } from "../content/section-form";

export const metadata: Metadata = { title: "Forms" };

const groups: { id: string; title: string; sections: SectionConfig[] }[] = [
  { id: "visitor-form", title: "Visitor form", sections: formSections },
  { id: "professionals-form", title: "Professionals' form", sections: proSections },
];

export default function FormPage() {
  return (
    <>
      <PageHeader
        title="Forms"
        description="Choose what the two registration forms ask. Each card saves on its own, and the forms on the site update as soon as you save."
        actions={
          <a
            href="/#register"
            target="_blank"
            rel="noreferrer"
            className="inline-flex min-h-11 items-center rounded-full bg-sun px-5 text-[15px] font-bold text-navy hover:brightness-105"
          >
            View the forms
          </a>
        }
      />
      <Container className="grid gap-6 lg:grid-cols-[220px_1fr] lg:items-start">
        <nav aria-label="Sections" className="lg:sticky lg:top-6">
          <ul className="flex gap-1 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible">
            {groups.map((g) => (
              <li key={g.id} className="contents lg:flex lg:flex-col lg:gap-1">
                <a
                  href={`#${g.id}`}
                  className="flex min-h-10 items-center rounded-xl px-3 text-[13px] font-bold tracking-[0.06em] whitespace-nowrap text-muted uppercase hover:bg-white hover:text-navy"
                >
                  {g.title}
                </a>
                {g.sections.map((s) => (
                  <a
                    key={s.id}
                    href={`#${s.id}`}
                    className="flex min-h-10 items-center rounded-xl px-3 text-[15px] font-semibold whitespace-nowrap text-body hover:bg-white hover:text-navy lg:pl-5"
                  >
                    {s.title}
                  </a>
                ))}
              </li>
            ))}
          </ul>
        </nav>
        <div className="flex min-w-0 flex-col gap-6">
          <Suspense fallback={<LoadingPanel label="Loading the forms…" />}>
            <Sections />
          </Suspense>
        </div>
      </Container>
    </>
  );
}

async function Sections() {
  const content = await getContent();
  return groups.map((g) => (
    <div key={g.id} className="flex flex-col gap-6">
      <h2 id={g.id} className="scroll-mt-6 pt-2 font-display text-[28px] font-extrabold text-navy">
        {g.title}
      </h2>
      {g.sections.map((s) => (
        <SectionForm key={s.id} config={s} values={content[s.id] as Record<string, unknown>} />
      ))}
    </div>
  ));
}
