import { Container } from "@/components/ui";

// Shared pieces for the admin pages.

export function PageHeader({ title, description, actions }: { title: string; description?: string; actions?: React.ReactNode }) {
  return (
    <Container className="flex flex-wrap items-end justify-between gap-4 pt-8 pb-6 sm:pt-10">
      <div className="flex flex-col gap-1.5">
        <h1 className="font-display text-[clamp(30px,4vw,44px)] leading-none font-extrabold tracking-[-0.02em] text-navy">
          {title}
        </h1>
        {description ? <p className="max-w-[640px] text-base text-muted">{description}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
    </Container>
  );
}

export function Stats({ items }: { items: { label: string; value: string }[] }) {
  return (
    <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-3xl bg-line shadow-[0_10px_30px_rgba(11,36,64,0.08)] md:grid-cols-[repeat(auto-fit,minmax(170px,1fr))]">
      {items.map((s) => (
        <div key={s.label} className="flex flex-col-reverse justify-end gap-1 bg-white p-6">
          <dt className="text-sm font-semibold text-muted">{s.label}</dt>
          <dd className="font-display text-[32px] leading-tight font-extrabold text-navy">{s.value}</dd>
        </div>
      ))}
    </dl>
  );
}

export function Panel({ title, children, className = "" }: { title?: string; children: React.ReactNode; className?: string }) {
  return (
    <section className={`rounded-3xl bg-white p-6 sm:p-8 ${className}`}>
      {title ? <h2 className="mb-4 text-[19px] font-bold">{title}</h2> : null}
      {children}
    </section>
  );
}

export function LoadingPanel({ label }: { label: string }) {
  return <p className="rounded-3xl bg-white p-8 text-muted">{label}</p>;
}

export const buttonClass =
  "inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-full bg-navy px-5 text-[15px] font-bold text-white transition-colors hover:bg-lake disabled:cursor-wait disabled:opacity-60";

export const secondaryButtonClass =
  "inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-full border-[1.5px] border-line-strong bg-white px-5 text-[15px] font-semibold text-navy transition-colors hover:border-navy disabled:cursor-wait disabled:opacity-60";

export const kes = new Intl.NumberFormat("en-KE", { style: "currency", currency: "KES", maximumFractionDigits: 0 });

export function nairobiDate(date: Date) {
  return date.toLocaleString("en-KE", { timeZone: "Africa/Nairobi", dateStyle: "medium", timeStyle: "short" });
}
