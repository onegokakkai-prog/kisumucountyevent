import Link from "next/link";
import { getContent } from "@/lib/content";
import { festival as festivalInfo } from "@/lib/festival";
import { FestivalBand, festivalColor } from "../festival-colors";
import { Icon } from "../icons";
import { SiteHeader } from "../site-header";
import { Container } from "../ui";
import { VoiceoverPlayer } from "./voiceover-player";

function LakeSunrise() {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox="0 0 1440 480"
      preserveAspectRatio="xMidYMax slice"
      className="absolute inset-x-0 bottom-0 h-[480px] w-full"
    >
      <g className="max-lg:translate-x-[-150px] max-lg:translate-y-[90px]">
        <circle cx="1120" cy="250" r="170" className="fill-sun" />
        <g className="stroke-sun max-lg:hidden" strokeWidth="6" strokeLinecap="round" opacity="0.55">
          <line x1="1120" y1="40" x2="1120" y2="0" />
          <line x1="965" y1="100" x2="935" y2="70" />
          <line x1="1275" y1="100" x2="1305" y2="70" />
          <line x1="900" y1="245" x2="855" y2="245" />
          <line x1="1340" y1="245" x2="1385" y2="245" />
        </g>
      </g>
      <path
        d="M0 290 C120 262 240 262 360 290 S600 318 720 290 960 262 1080 290 1320 318 1440 290 V480 H0Z"
        className="fill-lake"
      />
      <path
        d="M0 350 C120 322 240 322 360 350 S600 378 720 350 960 322 1080 350 1320 378 1440 350 V480 H0Z"
        className="fill-lake-2"
      />
      <path
        d="M0 410 C120 382 240 382 360 410 S600 438 720 410 960 382 1080 410 1320 438 1440 410 V480 H0Z"
        className="fill-lake-3"
      />
    </svg>
  );
}

export async function Hero() {
  const { festival, voiceover } = await getContent();
  const facts = [
    { term: "When", value: festival.dateLabel, note: festival.dateDetail },
    { term: "Where", value: festival.venue, note: festivalInfo.location },
    { term: "Who", value: "3,000+ attendees", note: "Learners, parents, educators & leaders" },
    { term: "Format", value: `${festivalInfo.durationLabel}, 6 tracks`, note: "Main stage plus all-day hubs" },
  ];

  return (
    <header data-hero className="bg-navy text-white">
      <FestivalBand className="relative z-20" />
      <div className="relative overflow-hidden">
        <LakeSunrise />
        <div className="relative z-10">
          <SiteHeader name={festival.name} />
        </div>

        <Container className="relative pt-12 pb-[250px] sm:pt-[72px]">
        <div className="flex max-w-[720px] flex-col gap-6 sm:gap-7">
          <p className="flex flex-wrap items-center gap-x-3.5 gap-y-2 text-[13px] font-semibold tracking-[0.04em] text-sun uppercase sm:text-[15px]">
            <span>{festival.dateLabel}</span>
            <span aria-hidden="true">·</span>
            <span>{festivalInfo.durationLabel}</span>
            <span aria-hidden="true">·</span>
            <span>{festival.venue}</span>
          </p>
          <h1 className="font-display text-[clamp(46px,7vw,92px)] leading-[0.95] font-extrabold tracking-[-0.03em] text-balance">
            {festival.name}
          </h1>
          <p className="max-w-[620px] text-[clamp(17px,2vw,22px)] leading-normal text-[#e3ebf2]">{festival.theme}</p>
          <div className="flex flex-wrap gap-3.5">
            <Link
              href="/#register"
              className="inline-flex min-h-[52px] items-center gap-2.5 rounded-full bg-sun px-7 text-[17px] font-bold text-navy transition-colors hover:brightness-105"
            >
              Register to attend
              <Icon name="arrow-right" size={18} strokeWidth={2.5} />
            </Link>
            <a
              href="#programme"
              className="inline-flex min-h-[52px] items-center rounded-full border-2 border-white/55 px-7 text-[17px] font-semibold text-white transition-colors hover:border-white hover:bg-white/10"
            >
              See the 2-day programme
            </a>
          </div>
          {voiceover.src ? <VoiceoverPlayer {...voiceover} /> : null}
        </div>
        </Container>
      </div>

      <div className="relative bg-white text-ink">
        <Container>
          <dl className="relative -mt-16 grid overflow-hidden rounded-[20px] bg-white shadow-[0_20px_50px_rgba(11,36,64,0.16)] sm:grid-cols-2 lg:grid-cols-4">
            {facts.map((f, i) => (
              <div
                key={f.term}
                className={`px-6 py-5 sm:px-7 sm:py-6 ${i > 0 ? "border-t border-line sm:border-t-0" : ""} ${
                  i % 2 === 1 ? "sm:border-l" : ""
                } ${i >= 2 ? "sm:border-t lg:border-t-0" : ""} ${i === 2 ? "lg:border-l" : ""} border-line`}
              >
                <dt className="flex items-center gap-2 text-[13px] font-bold tracking-[0.06em] text-muted uppercase">
                  <span aria-hidden="true" className={`size-2.5 rounded-full ${festivalColor(i + 1).solid}`} />
                  {f.term}
                </dt>
                <dd className="mt-1.5 font-display text-[22px] leading-tight font-bold">{f.value}</dd>
                <dd className="mt-1 text-sm text-muted">{f.note}</dd>
              </div>
            ))}
          </dl>
        </Container>
      </div>
    </header>
  );
}
