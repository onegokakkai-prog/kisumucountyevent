import { Hero } from "@/components/home/hero";
import {
  About,
  AccessHub,
  BuyABrick,
  Highlights,
  Outcomes,
  Partners,
  Preparation,
  Programme,
  Tracks,
} from "@/components/home/sections";
import { RegisterSection } from "@/components/home/register-section";
import { StickyRegister } from "@/components/home/sticky-register";
import { SiteFooter } from "@/components/site-footer";
import { getContent } from "@/lib/content";
import { festival as festivalInfo } from "@/lib/festival";

export default async function Home() {
  const { festival } = await getContent();
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: `${festival.name} ${festivalInfo.year}`,
    description: festival.theme,
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    eventStatus: "https://schema.org/EventScheduled",
    location: {
      "@type": "Place",
      name: festival.venue,
      address: { "@type": "PostalAddress", addressLocality: "Kisumu", addressRegion: "Kisumu County", addressCountry: "KE" },
    },
    organizer: [
      { "@type": "GovernmentOrganization", name: "County Government of Kisumu" },
      { "@type": "Organization", name: "Mary J Oasis for Education" },
    ],
  };

  return (
    <>
      <a
        href="#main"
        className="sr-only z-50 rounded-full bg-sun px-5 py-3 font-bold text-navy focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
      >
        Skip to content
      </a>
      <Hero />
      <StickyRegister name={festival.name} year={festivalInfo.year} dateLabel={festival.dateLabel} venue={festival.venue} />
      <main id="main">
        <About />
        <Preparation />
        <Tracks />
        <Programme />
        <Highlights />
        <AccessHub />
        <BuyABrick />
        <Outcomes />
        <RegisterSection />
        <Partners />
      </main>
      <SiteFooter />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </>
  );
}
