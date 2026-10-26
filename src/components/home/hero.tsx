import Image from "next/image";
import Link from "next/link";
import { getContent } from "@/lib/content";
import { festival as festivalInfo } from "@/lib/festival";
import { FestivalBand, festivalColor } from "../festival-colors";
import { Icon } from "../icons";
import { SiteHeader } from "../site-header";
import { Container } from "../ui";
import { VoiceoverPlayer } from "./voiceover-player";

// The festival banner's illustrations around the centred headline. Below lg they sit beside
// the headline text itself, smaller; from lg they spread across the whole hero.
const doodles = [
  {
    src: "/hero/pencil.webp",
    width: 308,
    height: 247,
    className: "-top-[9%] left-[2%] w-[11%] lg:top-0 lg:left-[17%] lg:w-[7.5%] lg:max-w-[150px]",
  },
  {
    src: "/hero/globe-cap.webp",
    width: 464,
    height: 487,
    className: "top-[26%] left-0 w-[16%] lg:top-[16%] lg:left-[4.5%] lg:w-[11.5%] lg:max-w-[230px]",
  },
  {
    src: "/hero/outline-cap.webp",
    width: 412,
    height: 336,
    className: "top-[68%] left-0 w-[15%] lg:top-[52%] lg:left-[6%] lg:w-[10%] lg:max-w-[205px]",
  },
  {
    src: "/hero/calculator.webp",
    width: 462,
    height: 478,
    className: "top-[24%] right-0 w-[16%] lg:top-[18%] lg:right-[5%] lg:w-[11.5%] lg:max-w-[230px]",
  },
  {
    src: "/hero/book.webp",
    width: 504,
    height: 441,
    className: "top-[62%] right-0 w-[17%] lg:top-[56%] lg:right-[4%] lg:w-[12.5%] lg:max-w-[250px]",
  },
];

// "Dala ka Dala, Gweng ka Gweng: Igniting …" -> the Dholuo line on its own, then the rest.
function splitTheme(theme: string) {
  const colon = theme.indexOf(":");
  if (colon === -1) return { lead: "", rest: theme };
  return { lead: theme.slice(0, colon + 1), rest: theme.slice(colon + 1).trim() };
}

export async function Hero() {
  const { festival, voiceover } = await getContent();
  const theme = splitTheme(festival.theme);
  const facts = [
    { term: "When", value: festival.dateLabel, note: festival.dateDetail },
    { term: "Where", value: festival.venue, note: festivalInfo.location },
    { term: "Who", value: "3,000+ attendees", note: "Learners, parents, educators & leaders" },
    { term: "Format", value: `${festivalInfo.durationLabel}, 6 tracks`, note: "Main stage plus all-day hubs" },
  ];

  return (
    <header data-hero className="bg-navy text-white">
      <FestivalBand className="relative z-20" />
      <div className="relative z-10">
        <SiteHeader name={festival.name} />
      </div>

      <div className="relative overflow-hidden">
        <Container className="flex flex-col items-center pt-12 pb-6 text-center sm:pt-16">
          {/* Positions the illustrations below lg; from lg they use the whole hero instead. */}
          <div className="relative flex w-full flex-col items-center px-[17%] lg:static lg:px-0">
            <div aria-hidden="true">
              {doodles.map((d) => (
                <Image key={d.src} src={d.src} alt="" width={d.width} height={d.height} priority className={`absolute h-auto ${d.className}`} />
              ))}
            </div>
            <h1 className="relative max-w-[16ch] font-display text-[clamp(26px,5.8vw,96px)] leading-[0.98] font-extrabold tracking-[-0.02em] text-balance">
              {festival.name}
            </h1>
            <p className="relative mt-4 flex max-w-[860px] flex-col gap-2 sm:mt-8 sm:gap-3">
              {theme.lead ? (
                <span className="font-display text-[clamp(18px,3vw,48px)] leading-tight font-medium text-balance">{theme.lead}</span>
              ) : null}
              <span className="text-[clamp(13px,1.7vw,27px)] leading-snug font-semibold text-balance">{theme.rest}</span>
            </p>
            <span aria-hidden="true" className="relative mt-5 h-1 w-16 rounded-full bg-white sm:mt-10 sm:h-1.5 sm:w-28" />
            <p className="relative mt-4 flex flex-col gap-1 text-[clamp(14px,1.7vw,27px)] font-semibold sm:mt-8 sm:gap-1.5">
              <span>{festival.dateLabel}</span>
              <span>
                <span className="text-sun">Venue:</span> {festival.venue}
              </span>
            </p>
          </div>
          <div className="relative mt-7 flex flex-wrap justify-center gap-2.5 sm:mt-8 sm:gap-3.5">
            <Link
              href="/#register"
              className="inline-flex min-h-11 items-center gap-2 rounded-full bg-sun px-5 text-[15px] font-bold text-navy transition-colors hover:brightness-105 sm:min-h-[52px] sm:gap-2.5 sm:px-7 sm:text-[17px]"
            >
              Register to attend
              <Icon name="arrow-right" size={18} strokeWidth={2.5} />
            </Link>
            <a
              href="#programme"
              className="inline-flex min-h-11 items-center rounded-full border-2 border-white/55 px-5 text-[15px] font-semibold text-white transition-colors hover:border-white hover:bg-white/10 sm:min-h-[52px] sm:px-7 sm:text-[17px]"
            >
              See the 2-day programme
            </a>
          </div>
          {voiceover.src ? (
            <div className="relative mt-6 flex w-full justify-center">
              <VoiceoverPlayer {...voiceover} />
            </div>
          ) : null}
        </Container>

        {/* Hills and Lake Victoria from the festival banner; the sky is the navy behind it. */}
        <Image
          src="/hero/landscape.webp"
          alt=""
          width={2400}
          height={522}
          sizes="100vw"
          priority
          className="relative -mt-[3vw] block h-auto min-h-[150px] w-full object-cover object-[22%_50%]"
        />
      </div>

      <div className="relative bg-white text-ink">
        <Container>
          <dl className="relative -mt-8 grid sm:-mt-12 lg:-mt-16 overflow-hidden rounded-[20px] bg-white shadow-[0_20px_50px_rgba(11,36,64,0.16)] sm:grid-cols-2 lg:grid-cols-4">
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
