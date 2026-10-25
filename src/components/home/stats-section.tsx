import { getContent } from "@/lib/content";
import { getPublicStats, type Count } from "@/lib/public-stats";
import { Container, Eyebrow, SectionTitle } from "../ui";
import { RoleDonut } from "./role-donut";

// "Who's coming": live totals from registrations, shown once enough people have registered.

const fmt = (n: number) => n.toLocaleString("en-KE");

// A ranked list of horizontal bars, one hue, each value labelled.
function Bars({ items, unit }: { items: Count[]; unit: string }) {
  const max = Math.max(1, ...items.map((i) => i.count));
  return (
    <ul className="flex flex-col gap-3.5">
      {items.map((item) => (
        <li key={item.label} className="group flex flex-col gap-1.5" title={`${item.label}: ${fmt(item.count)} ${unit}`}>
          <div className="flex items-baseline justify-between gap-4 text-[15px]">
            <span className="min-w-0 text-ink">{item.label}</span>
            <span className="font-bold text-ink tabular-nums">{fmt(item.count)}</span>
          </div>
          <div className="h-3 rounded-[4px] bg-mist-2">
            <div
              className="h-full rounded-[4px] bg-[#3b82c4] transition-[filter] group-hover:brightness-110"
              style={{ width: `${item.count ? Math.max(2, (item.count / max) * 100) : 0}%` }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}

function Card({ title, note, children, className = "" }: { title: string; note?: string; children: React.ReactNode; className?: string }) {
  return (
    <section className={`flex flex-col gap-6 rounded-[24px] border border-line bg-white p-6 sm:p-8 ${className}`}>
      <div className="flex flex-col gap-1">
        <h3 className="text-[19px] font-bold text-navy">{title}</h3>
        {note ? <p className="text-sm text-muted">{note}</p> : null}
      </div>
      {children}
    </section>
  );
}

export async function StatsSection() {
  const [{ stats: settings }, stats] = await Promise.all([getContent(), getPublicStats()]);
  if (!settings.show || !stats || stats.registrations < settings.minRegistrations) return null;

  const tiles = [
    { label: "Registrations", value: fmt(stats.registrations), tone: "bg-sun-soft" },
    { label: "People coming", value: fmt(stats.people), tone: "bg-coral-soft" },
    { label: "Professionals on board", value: fmt(stats.professionals), tone: "bg-teal-soft" },
    { label: "Wards reached", value: `${fmt(stats.wardsReached)} of ${stats.totalWards}`, tone: "bg-azure-soft" },
  ];
  const interests = stats.interests.filter((i) => i.count > 0);

  return (
    <section id="stats" aria-labelledby="stats-title" className="bg-mist py-24 sm:py-[100px]">
      <Container className="flex flex-col gap-10">
        <div className="flex max-w-[720px] flex-col gap-3.5">
          <Eyebrow>{settings.eyebrow}</Eyebrow>
          <SectionTitle id="stats-title">{settings.title}</SectionTitle>
          {settings.body ? <p className="text-lg leading-relaxed text-body">{settings.body}</p> : null}
        </div>

        <dl className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {tiles.map((t) => (
            <div key={t.label} className={`flex flex-col-reverse gap-1.5 rounded-[20px] px-6 py-5 ${t.tone}`}>
              <dt className="text-[15px] font-semibold text-body">{t.label}</dt>
              <dd className="font-display text-[clamp(30px,4vw,44px)] leading-none font-extrabold text-navy tabular-nums">{t.value}</dd>
            </div>
          ))}
        </dl>

        <div className="grid gap-5 lg:grid-cols-2">
          <Card title="Who's registering" note="Registrations by how people are attending.">
            <RoleDonut counts={stats.roles} total={stats.registrations} totalLabel="registrations" />
          </Card>
          <Card title="Where they're coming from" note="People coming, by sub-county.">
            <Bars items={stats.subCounties.filter((s) => s.count > 0)} unit="people" />
          </Card>
          <Card title="People each day" note="Including family and school groups.">
            <Bars items={stats.days} unit="people" />
          </Card>
          {interests.length ? (
            <Card title="Most popular so far" note="What registrants are most interested in.">
              <Bars items={interests} unit="registrants" />
            </Card>
          ) : null}
        </div>
      </Container>
    </section>
  );
}
