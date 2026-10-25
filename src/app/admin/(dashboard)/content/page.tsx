import type { Metadata } from "next";
import { Suspense } from "react";
import { Container } from "@/components/ui";
import { getContent } from "@/lib/content";
import { r2Configured } from "@/lib/r2";
import { LoadingPanel, PageHeader } from "../admin-ui";
import { sections } from "./fields";
import { SectionForm } from "./section-form";

export const metadata: Metadata = { title: "Site content" };

export default function ContentPage() {
  return (
    <>
      <PageHeader
        title="Site content"
        description="Change what the website says and shows. Each section saves on its own, and the site updates as soon as you save."
      />
      <Container className="grid gap-6 lg:grid-cols-[220px_1fr] lg:items-start">
        <nav aria-label="Sections" className="lg:sticky lg:top-6">
          <ul className="flex gap-1 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible">
            {sections.map((s) => (
              <li key={s.id}>
                <a
                  href={`#${s.id}`}
                  className="flex min-h-10 items-center rounded-xl px-3 text-[15px] font-semibold whitespace-nowrap text-body hover:bg-white hover:text-navy"
                >
                  {s.title}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <div className="flex min-w-0 flex-col gap-6">
          {r2Configured() ? null : (
            <p className="rounded-2xl border-2 border-sun bg-sun/15 px-5 py-4 text-[15px] text-ink">
              <strong>Uploads are off.</strong> Photo and recording uploads need the Cloudflare R2 settings (R2_ACCOUNT_ID,
              R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET, R2_PUBLIC_URL). Text and colours can still be edited.
            </p>
          )}
          <Suspense fallback={<LoadingPanel label="Loading content…" />}>
            <Sections />
          </Suspense>
        </div>
      </Container>
    </>
  );
}

async function Sections() {
  const content = await getContent();
  return sections.map((s) => <SectionForm key={s.id} config={s} values={content[s.id] as Record<string, unknown>} />);
}
