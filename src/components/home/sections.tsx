import Image from "next/image";
import Link from "next/link";
import { getContent } from "@/lib/content";
import { continuum, type TrackTone } from "@/lib/festival";
import { getReceivedTotal } from "@/lib/pledges";
import { festivalColor, trackColor } from "../festival-colors";
import { Icon } from "../icons";
import { Container, Eyebrow, SectionTitle } from "../ui";
import { PledgeDialog } from "./pledge-dialog";
import { PreparationGallery } from "./preparation-gallery";
import { ProgrammeTabs } from "./programme-tabs";

export async function About() {
  const { about } = await getContent();
  const tones = ["bg-sun-soft text-ink", "bg-coral-soft text-ink", "bg-teal-soft text-ink", "bg-lake text-white", "bg-navy text-white"];
  const numbers = ["text-sun-ink", "text-coral-ink", "text-teal-ink", "text-sun", "text-sun"];
  return (
    <section id="about" aria-labelledby="about-title">
      <Container className="flex flex-col gap-14 pt-28 pb-24 sm:pt-[120px] sm:pb-[100px]">
        <div className="flex flex-wrap items-end gap-x-20 gap-y-6">
          <SectionTitle id="about-title" className="flex-[1_1_420px] text-navy">
            {about.title}
          </SectionTitle>
          <p className="flex-[1_1_420px] text-lg leading-[1.65] text-body">{about.body}</p>
        </div>
        <ol aria-label="The learning continuum" className="grid grid-cols-[repeat(auto-fit,minmax(150px,1fr))] gap-3">
          {continuum.map((c, i) => {
            const dark = i >= 3;
            return (
              <li key={c.stage} className={`flex flex-col gap-2.5 rounded-2xl px-5 py-[22px] ${tones[i]}`}>
                <span className={`font-display text-[15px] font-extrabold ${numbers[i] ?? "text-sun"}`}>
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="text-lg font-bold">{c.stage}</span>
                <span className={`text-sm leading-normal ${dark ? "text-haze" : "text-body"}`}>{c.detail}</span>
              </li>
            );
          })}
        </ol>
      </Container>
    </section>
  );
}

export async function Preparation() {
  const { preparation } = await getContent();
  if (!preparation.photos.length) return null;
  return (
    <section id="preparation" aria-labelledby="preparation-title" className="pb-24 sm:pb-[100px]">
      <Container className="flex flex-col gap-10">
        <div className="flex flex-wrap items-end justify-between gap-x-20 gap-y-4">
          <div className="flex max-w-[620px] flex-col gap-3.5">
            <Eyebrow>{preparation.eyebrow}</Eyebrow>
            <SectionTitle id="preparation-title">{preparation.title}</SectionTitle>
          </div>
          <p className="max-w-[440px] text-lg leading-[1.65] text-body">{preparation.body}</p>
        </div>
        <PreparationGallery photos={preparation.photos} />
      </Container>
    </section>
  );
}

const toneStyles: Record<TrackTone, { card: string; number: string; text: string; meta: string }> = {
  light: { card: "border border-line bg-white", number: "text-navy", text: "text-muted", meta: "text-lake" },
  dark: { card: "bg-navy text-white", number: "text-sun", text: "text-haze", meta: "text-sun" },
  sun: { card: "bg-sun text-navy", number: "text-navy", text: "text-navy", meta: "text-navy font-bold" },
};

export async function Tracks() {
  const content = (await getContent()).tracks;
  return (
    <section id="tracks" aria-labelledby="tracks-title" className="bg-mist py-24 sm:py-[100px]">
      <Container className="flex flex-col gap-12">
        <div className="flex max-w-[680px] flex-col gap-3.5">
          <Eyebrow>{content.eyebrow}</Eyebrow>
          <SectionTitle id="tracks-title">{content.title}</SectionTitle>
        </div>
        <ul className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {content.items.map((t, i) => {
            const s = toneStyles[t.tone] ?? toneStyles.light;
            const c = trackColor(t.number) ?? festivalColor(i);
            const light = t.tone === "light" || !toneStyles[t.tone];
            return (
              <li
                key={`${t.number}-${i}`}
                className={`relative flex flex-col gap-4 overflow-hidden rounded-[20px] p-7 sm:p-8 ${s.card}`}
              >
                {light ? <span aria-hidden="true" className={`absolute inset-x-0 top-0 h-1.5 ${c.solid}`} /> : null}
                <div className="flex items-center justify-between">
                  <span className={`font-display text-[44px] leading-none font-extrabold ${light ? c.ink : s.number}`}>
                    <span className="sr-only">Track </span>
                    {t.number}
                  </span>
                  <span
                    className={`flex size-14 items-center justify-center rounded-full ${
                      t.tone === "sun" ? "bg-navy text-sun" : `${c.solid} ${c.onSolid}`
                    }`}
                  >
                    <Icon name={t.icon} size={28} strokeWidth={1.9} />
                  </span>
                </div>
                <h3 className="text-[21px] leading-[1.3] font-bold">{t.title}</h3>
                <ul className={`flex flex-col gap-2 text-base leading-snug ${s.text}`}>
                  {t.activities.map((a) => (
                    <li key={a} className="flex gap-2.5">
                      <span aria-hidden="true" className={`mt-[9px] size-1.5 flex-none rounded-full bg-current ${s.meta}`} />
                      {a}
                    </li>
                  ))}
                </ul>
              </li>
            );
          })}
          <li className="flex flex-col justify-center gap-4 rounded-[20px] border-2 border-dashed border-line-strong bg-white p-7 sm:p-8">
            <h3 className="text-[21px] leading-[1.3] font-bold text-navy">Not sure where to start?</h3>
            <p className="text-base leading-relaxed text-muted">
              Tell us who you are when you register and we&apos;ll point you to the sessions, clinics and desks that
              fit.
            </p>
            <Link
              href="/#register"
              className="inline-flex min-h-11 items-center gap-2 self-start text-base font-bold text-navy underline-offset-4 hover:underline"
            >
              Plan my visit <Icon name="arrow-right" size={18} strokeWidth={2.5} />
            </Link>
          </li>
        </ul>
      </Container>
    </section>
  );
}

export async function Programme() {
  const { programme } = await getContent();
  return (
    <section id="programme" aria-labelledby="programme-title">
      <Container className="flex flex-col gap-10 py-24 sm:py-[110px]">
        <div className="flex max-w-[680px] flex-col gap-3.5">
          <Eyebrow>{programme.eyebrow}</Eyebrow>
          <SectionTitle id="programme-title">{programme.title}</SectionTitle>
        </div>
        <ProgrammeTabs days={programme.days} />
      </Container>
    </section>
  );
}

export async function Keynote() {
  const { keynote } = await getContent();
  if (keynote.items.length === 0) return null;
  const single = keynote.items.length === 1;
  return (
    <section id="keynote" aria-labelledby="keynote-title" className="scroll-mt-16 pb-24 sm:pb-[110px]">
      <Container className="flex flex-col gap-10">
        <div className="flex max-w-[680px] flex-col gap-3.5">
          <Eyebrow>{keynote.eyebrow}</Eyebrow>
          <SectionTitle id="keynote-title">{keynote.title}</SectionTitle>
        </div>
        <ul className={single ? "flex flex-col" : "grid gap-6 md:grid-cols-2"}>
          {keynote.items.map((k, i) => {
            const c = festivalColor(i + 1);
            const announced = !/^to be announced$/i.test(k.name.trim());
            return (
              <li
                key={`${k.name}-${i}`}
                className={`relative grid overflow-hidden rounded-[28px] ${c.soft} ${single ? "md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]" : ""}`}
              >
                <div className={`relative ${single ? "aspect-[4/3] md:aspect-auto md:min-h-[420px]" : "aspect-[4/3]"} ${c.solid}`}>
                  {k.photo ? (
                    <Image
                      src={k.photo}
                      alt={`Portrait of ${k.name}`}
                      fill
                      sizes={single ? "(min-width: 768px) 520px, 100vw" : "(min-width: 768px) 600px, 100vw"}
                      className="object-cover"
                    />
                  ) : (
                    <div aria-hidden="true" className="absolute inset-0 flex items-center justify-center">
                      <svg viewBox="0 0 400 300" preserveAspectRatio="none" className="absolute inset-x-0 bottom-0 h-1/2 w-full opacity-25">
                        <path d="M0 60 C70 40 130 40 200 60 S330 80 400 60 V300 H0Z" className="fill-white" />
                        <path d="M0 120 C70 100 130 100 200 120 S330 140 400 120 V300 H0Z" className="fill-navy" />
                      </svg>
                      <span className="relative flex size-32 items-center justify-center rounded-full bg-white/90 font-display text-5xl font-extrabold text-navy">
                        {announced ? initials(k.name) : <Icon name="speech" size={56} strokeWidth={1.6} />}
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex flex-col justify-center gap-4 p-7 sm:p-10">
                  {k.when ? <p className={`text-sm font-bold tracking-[0.06em] uppercase ${c.ink}`}>{k.when}</p> : null}
                  <div className="flex flex-col gap-1.5">
                    <h3 className="font-display text-[clamp(28px,3.2vw,40px)] leading-[1.05] font-extrabold tracking-[-0.02em] text-navy">
                      {k.name}
                    </h3>
                    {k.role ? <p className="text-lg font-semibold text-body">{k.role}</p> : null}
                  </div>
                  {k.talk ? (
                    <p className="flex items-start gap-3 text-xl leading-snug font-bold text-ink">
                      <span aria-hidden="true" className={`mt-1 flex size-8 flex-none items-center justify-center rounded-full ${c.solid} ${c.onSolid}`}>
                        <Icon name="speech" size={16} strokeWidth={2.2} />
                      </span>
                      <span>
                        <span className="sr-only">Talk: </span>
                        {k.talk}
                      </span>
                    </p>
                  ) : null}
                  {k.bio ? <p className="max-w-[560px] text-base leading-relaxed text-body">{k.bio}</p> : null}
                </div>
              </li>
            );
          })}
        </ul>
      </Container>
    </section>
  );
}

export async function Highlights() {
  const { highlights } = await getContent();
  return (
    <section aria-labelledby="highlights-title" className="bg-navy py-24 text-white sm:py-[100px]">
      <Container className="flex flex-col gap-12">
        <SectionTitle id="highlights-title" className="max-w-[760px] text-white">
          {highlights.title}
        </SectionTitle>
        <ul className="grid gap-x-6 gap-y-12 md:grid-cols-3">
          {highlights.items.map((h, i) => (
            <li key={`${h.title}-${i}`} className="flex flex-col gap-[18px]">
              {h.image ? (
                <div className="relative aspect-[4/3] overflow-hidden rounded-[18px] bg-lake">
                  <Image src={h.image} alt="" fill sizes="(min-width: 768px) 400px, 100vw" className="object-cover" />
                </div>
              ) : (
                <div className="relative flex aspect-[4/3] items-center justify-center overflow-hidden rounded-[18px] bg-lake">
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 400 300"
                    preserveAspectRatio="none"
                    className="absolute inset-x-0 bottom-0 h-1/2 w-full"
                  >
                    <path d="M0 60 C70 40 130 40 200 60 S330 80 400 60 V300 H0Z" className="fill-lake-2" />
                    <path d="M0 110 C70 90 130 90 200 110 S330 130 400 110 V300 H0Z" className="fill-lake-3" />
                  </svg>
                  <span
                    className={`relative flex size-28 items-center justify-center rounded-full ${
                      [festivalColor(0), festivalColor(1), festivalColor(2)][i % 3].solid
                    } ${[festivalColor(0), festivalColor(1), festivalColor(2)][i % 3].onSolid}`}
                  >
                    <Icon name={h.icon} size={52} strokeWidth={1.6} />
                  </span>
                </div>
              )}
              <p className="text-sm font-bold tracking-[0.06em] text-sun uppercase">{h.when}</p>
              <h3 className="text-2xl leading-tight font-bold">{h.title}</h3>
              <p className="text-base leading-relaxed text-haze">{h.description}</p>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}

export async function AccessHub() {
  const { access } = await getContent();
  return (
    <section id="access" aria-labelledby="access-title">
      <Container className="flex flex-wrap gap-14 py-24 sm:py-[110px]">
        <div className="flex flex-[1_1_380px] flex-col gap-5">
          <Eyebrow>{access.eyebrow}</Eyebrow>
          <SectionTitle id="access-title">{access.title}</SectionTitle>
          <p className="text-lg leading-[1.65] text-body">{access.body}</p>
          <Link
            href="/#access-hub"
            className="inline-flex min-h-[52px] items-center self-start rounded-full bg-navy px-[26px] text-base font-bold text-white transition-colors hover:bg-lake"
          >
            Book a hub slot
          </Link>
        </div>
        <ul className="flex flex-[1.4_1_480px] flex-col gap-3.5">
          {access.items.map((s, i) => (
            <li key={`${s.title}-${i}`} className="flex items-start gap-5 rounded-[18px] bg-mist p-6 sm:p-[26px]">
              <span
                className={`flex size-[52px] flex-none items-center justify-center rounded-[14px] ${festivalColor(i + 2).solid} ${
                  festivalColor(i + 2).onSolid
                }`}
              >
                <Icon name={s.icon} size={26} />
              </span>
              <div className="flex flex-col gap-1.5">
                <h3 className="text-xl font-bold">{s.title}</h3>
                <p className="text-base leading-normal text-muted">{s.description}</p>
              </div>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}

const kes = new Intl.NumberFormat("en-KE", { style: "currency", currency: "KES", maximumFractionDigits: 0 });

export async function BuyABrick() {
  const { brick, festival } = await getContent();
  const { target, pricePerBrick } = brick;
  const raised = brick.raisedOffline + (await getReceivedTotal());
  const hasProgress = target !== null && target > 0;
  const pct = hasProgress ? Math.min(100, Math.round((raised / target) * 100)) : 0;
  const filled = Math.round(pct / 10);

  return (
    <section id="brick" aria-labelledby="brick-title" className="px-4 pb-24 sm:px-8 sm:pb-[110px]">
      <div className="mx-auto flex max-w-[1240px] flex-wrap items-center gap-12 rounded-[28px] bg-sun p-7 text-navy sm:p-12 lg:p-16">
        <div className="flex flex-[1_1_420px] flex-col gap-5">
          <Eyebrow className="font-extrabold text-navy">{brick.eyebrow}</Eyebrow>
          <h2
            id="brick-title"
            className="font-display text-[clamp(36px,4.6vw,60px)] leading-none font-extrabold tracking-[-0.03em] text-balance"
          >
            {brick.title}
          </h2>
          <p className="text-lg leading-relaxed">{brick.body}</p>
          <PledgeDialog
            label={pricePerBrick ? `Pledge a brick — ${kes.format(pricePerBrick)}` : "Pledge a brick"}
            pricePerBrick={pricePerBrick}
            paybill={brick.paybill}
            account={brick.account}
            instructions={brick.instructions}
            phoneLabel={festival.phoneLabel}
          />
        </div>
        <div className="flex flex-[1_1_340px] flex-col gap-[18px] rounded-[20px] bg-white p-7 sm:p-8">
          {hasProgress ? (
            <>
              <div className="flex flex-wrap items-baseline justify-between gap-3">
                <span className="font-display text-[34px] font-extrabold">{kes.format(raised)}</span>
                <span className="text-[15px] font-semibold text-muted">of {kes.format(target)}</span>
              </div>
              <div
                role="progressbar"
                aria-label="Buy-a-Brick fundraising progress"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={pct}
                className="grid grid-cols-10 gap-[5px]"
              >
                {Array.from({ length: 10 }, (_, i) => (
                  <span key={i} className={`h-[22px] rounded ${i < filled ? "bg-rust" : "bg-[#f3d9c8]"}`} />
                ))}
              </div>
              <p className="text-[15px] text-muted">{pct}% of the way to the goal.</p>
            </>
          ) : (
            <>
              <div aria-hidden="true" className="grid grid-cols-10 gap-[5px]">
                {Array.from({ length: 10 }, (_, i) => (
                  <span key={i} className="h-[22px] rounded bg-[#f3d9c8]" />
                ))}
              </div>
              <p className="font-display text-2xl font-extrabold">Every brick counts.</p>
              <p className="text-[15px] leading-normal text-muted">
                Pledge today and send your gift by M-Pesa. Progress will be shown here once the fundraising goal is
                set.
              </p>
            </>
          )}
        </div>
      </div>
    </section>
  );
}

export async function Outcomes() {
  const { outcomes } = await getContent();
  return (
    <section aria-labelledby="outcomes-title" className="bg-sun-soft py-24 sm:py-[100px]">
      <Container className="flex flex-col gap-11">
        <h2
          id="outcomes-title"
          className="max-w-[720px] font-display text-[clamp(28px,3.6vw,44px)] leading-[1.08] font-extrabold tracking-[-0.02em] text-navy"
        >
          {outcomes.title}
        </h2>
        <dl className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-x-8 gap-y-10">
          {outcomes.items.map((o, i) => (
            <div
              key={`${o.value}-${i}`}
              className={`flex flex-col-reverse justify-end gap-2 border-t-[5px] pt-[18px] ${festivalColor(i + 1).border}`}
            >
              <dt className="text-base leading-normal text-body">{o.label}</dt>
              <dd className={`font-display text-[56px] leading-none font-extrabold ${festivalColor(i + 1).ink}`}>{o.value}</dd>
            </div>
          ))}
        </dl>
      </Container>
    </section>
  );
}

export async function Partners() {
  const { partners: content, festival } = await getContent();
  return (
    <section id="partners" aria-labelledby="partners-title">
      <Container className="flex flex-col gap-10 py-24 sm:py-[100px]">
        <h2
          id="partners-title"
          className="font-display text-[clamp(28px,3.6vw,44px)] leading-[1.08] font-extrabold tracking-[-0.02em] text-navy"
        >
          {content.title}
        </h2>
        <ul className="grid gap-5 md:grid-cols-3">
          {content.items.map((p, i) => (
            <li key={`${p.name}-${i}`} className="flex flex-col gap-[18px] rounded-[20px] border border-line p-7">
              <div className="relative h-32 rounded-xl bg-white">
                {p.logo ? (
                  <Image src={p.logo} alt={`${p.name} logo`} fill sizes="300px" className="object-contain" />
                ) : null}
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[13px] font-bold tracking-[0.06em] text-rust uppercase">{p.role}</span>
                <span className="text-lg font-bold">{p.name}</span>
              </div>
            </li>
          ))}
        </ul>
        <OrganisingTeam />
        <p className="text-base text-body">
          Interested in sponsoring or exhibiting?{" "}
          <a href={`tel:${festival.phone}`} className="font-bold text-navy underline underline-offset-4">
            Call {festival.phoneLabel}
          </a>
        </p>
      </Container>
    </section>
  );
}

// A native <details> pull-down: works without JavaScript and is announced as expandable.
async function OrganisingTeam() {
  const { team } = await getContent();
  if (team.items.length === 0) return null;
  return (
    <details id="team" className="group scroll-mt-24 rounded-[20px] border border-line">
      <summary className="flex min-h-11 cursor-pointer list-none items-center gap-4 rounded-[20px] p-6 sm:p-7 [&::-webkit-details-marker]:hidden">
        <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-mist text-navy">
          <Icon name="person" size={22} />
        </span>
        <span className="mr-auto flex flex-col gap-0.5">
          <span className="font-display text-xl font-extrabold text-navy sm:text-2xl">{team.title}</span>
          {team.body ? <span className="text-base text-body">{team.body}</span> : null}
        </span>
        <span className="flex size-10 shrink-0 items-center justify-center rounded-full border-[1.5px] border-line-strong text-navy transition-transform group-open:rotate-90">
          <Icon name="chevron-right" size={18} strokeWidth={2.4} />
        </span>
      </summary>
      <ul className="grid grid-cols-[repeat(auto-fill,minmax(250px,1fr))] gap-4 px-6 pb-6 sm:px-7 sm:pb-7">
        {team.items.map((m, i) => (
          <li key={`${m.name}-${i}`} className="flex flex-col gap-4 rounded-2xl bg-mist p-5">
            <div className="flex items-center gap-4">
              {m.photo ? (
                <Image src={m.photo} alt="" width={80} height={80} className="size-20 shrink-0 rounded-full object-cover" />
              ) : (
                <span aria-hidden="true" className="flex size-20 shrink-0 items-center justify-center rounded-full bg-navy font-display text-2xl font-extrabold text-sun">
                  {initials(m.name)}
                </span>
              )}
              <span className="flex min-w-0 flex-col gap-0.5">
                <span className="text-lg leading-snug font-bold text-ink">{m.name}</span>
                {m.role ? <span className="text-[13px] font-bold tracking-[0.06em] text-rust uppercase">{m.role}</span> : null}
              </span>
            </div>
            {m.bio ? <p className="text-[15px] leading-relaxed text-body">{m.bio}</p> : null}
          </li>
        ))}
      </ul>
    </details>
  );
}

function initials(name: string) {
  const words = name.split(/\s+/).filter((w) => /^[A-Za-z]/.test(w));
  if (words.length === 0 || /^to be/i.test(name)) return "?";
  return (words[0][0] + (words.length > 1 ? words[words.length - 1][0] : "")).toUpperCase();
}
