import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import {
  brickDrive,
  festival,
  highlights,
  organisingTeam,
  outcomes,
  partners,
  preparationPhotos,
  programme,
  tracks,
  voiceover,
  type FestivalDay,
  type Photo,
  accessServices,
  type ContentIcon,
  type TrackTone,
} from "./festival";
import { getDb } from "./mongodb";

// Everything organisers can change from /admin/content. The defaults come from festival.ts;
// whatever is saved in the database overrides them section by section.

export type { Photo };

export type Highlight = { when: string; title: string; description: string; icon: ContentIcon; image: string };
export type TrackCard = { number: string; title: string; activities: string[]; icon: ContentIcon; tone: TrackTone };
export type AccessCard = { title: string; description: string; icon: ContentIcon };
export type Outcome = { value: string; label: string };
export type Partner = { role: string; name: string; logo: string };
export type TeamMember = { name: string; role: string; bio: string; photo: string };

export type SiteContent = {
  colors: { navy: string; lake: string; sun: string; rust: string; mist: string };
  festival: {
    name: string;
    theme: string;
    dateLabel: string;
    dateDetail: string;
    venue: string;
    gates: string;
    phone: string;
    phoneLabel: string;
  };
  about: { title: string; body: string };
  preparation: { eyebrow: string; title: string; body: string; photos: Photo[] };
  tracks: { eyebrow: string; title: string; items: TrackCard[] };
  programme: { eyebrow: string; title: string; days: FestivalDay[] };
  highlights: { title: string; items: Highlight[] };
  outcomes: { title: string; items: Outcome[] };
  access: { eyebrow: string; title: string; body: string; items: AccessCard[] };
  brick: {
    eyebrow: string;
    title: string;
    body: string;
    pricePerBrick: number | null;
    target: number | null;
    raisedOffline: number;
    paybill: string;
    account: string;
    instructions: string;
  };
  register: { title: string; body: string };
  partners: { title: string; items: Partner[] };
  team: { title: string; body: string; items: TeamMember[] };
  voiceover: { src: string; title: string; duration: string };
};

export type ContentSection = keyof SiteContent;

export const defaultContent: SiteContent = {
  colors: { navy: "#0b2440", lake: "#13466b", sun: "#f5b82e", rust: "#c2410c", mist: "#f4f7f9" },
  festival: {
    name: festival.name,
    theme: festival.theme,
    dateLabel: festival.dateLabel,
    dateDetail: festival.dateDetail,
    venue: festival.venue,
    gates: festival.gates,
    phone: festival.phone,
    phoneLabel: festival.phoneLabel,
  },
  about: {
    title: "One public platform for the whole learning journey.",
    body: "A multi-track regional gathering aligning education policy, teaching innovation, civic leadership and student career pathways across Kisumu County and the wider Lake Victoria basin — with a clear focus on the Competency-Based Education (CBE) transition.",
  },
  preparation: {
    eyebrow: "Road to the festival",
    title: "Preparations are under way.",
    body: "Schools, teachers and partners across the county are getting ready. Here's a look behind the scenes.",
    photos: preparationPhotos,
  },
  tracks: {
    eyebrow: "Six festival tracks",
    title: "Find the part of the festival that's for you.",
    items: tracks.map((t) => ({ ...t })),
  },
  programme: {
    eyebrow: "Two-day programme",
    title: "Main stage by day. Hubs and clinics all day.",
    days: programme,
  },
  highlights: {
    title: "Three moments you won't want to miss.",
    items: highlights.map((h) => ({ ...h, image: "" })),
  },
  outcomes: {
    title: "What the festival sets out to achieve",
    items: outcomes.map((o) => ({ ...o })),
  },
  access: {
    eyebrow: "Track 4 · Open both days",
    title: "Get real support, on the spot.",
    body: "The Access Hub runs from opening to closing on both days. Walk in, or book a slot when you register to skip the queue.",
    items: accessServices.map((s) => ({ ...s })),
  },
  brick: {
    eyebrow: "Track 5 · Community drive",
    title: "Buy a brick. Build a school.",
    body: "Every brick helps expand Grace of Mariatta Academy, an underserved learning centre in our community. Funds raised are handed over at the festival's closing ceremony.",
    pricePerBrick: brickDrive.pricePerBrick,
    target: brickDrive.target,
    raisedOffline: brickDrive.raised ?? 0,
    paybill: "",
    account: "BRICK",
    instructions:
      "Go to M-Pesa and choose Lipa na M-Pesa, then Pay Bill.\nEnter the business number and account shown here.\nEnter the amount you pledged and your M-Pesa PIN.\nKeep the confirmation SMS; the festival team will confirm your brick.",
  },
  register: {
    title: "Plan your visit",
    body: "Two minutes. Tell us who you are and what you're coming for, and we'll be in touch with your entry details.",
  },
  partners: { title: "Brought to you by", items: partners.map(({ role, name, logo }) => ({ role, name, logo })) },
  team: {
    title: "Meet the organising team",
    body: "The people bringing the festival together.",
    items: organisingTeam.map((m) => ({ ...m, bio: "", photo: "" })),
  },
  voiceover,
};

type StoredContent = { _id: "site"; updatedAt?: Date } & Partial<SiteContent>;

function contentCollection() {
  return getDb().collection<StoredContent>("content");
}

function merge(stored: Partial<SiteContent> | null): SiteContent {
  const out = { ...defaultContent } as Record<ContentSection, unknown>;
  if (stored) {
    for (const key of Object.keys(defaultContent) as ContentSection[]) {
      if (stored[key]) out[key] = { ...defaultContent[key], ...stored[key] };
    }
  }
  return out as SiteContent;
}

export async function getContent(): Promise<SiteContent> {
  "use cache";
  cacheTag("content");
  try {
    const stored = await contentCollection().findOne({ _id: "site" }, { projection: { _id: 0 } });
    cacheLife("max");
    return merge(stored);
  } catch (err) {
    // Keep the site up on the built-in defaults, and try the database again soon.
    console.error("Failed to load site content", err);
    cacheLife("minutes");
    return defaultContent;
  }
}

export async function saveContentSection<K extends ContentSection>(section: K, value: SiteContent[K]) {
  await contentCollection().updateOne(
    { _id: "site" },
    { $set: { [section]: value, updatedAt: new Date() } },
    { upsert: true },
  );
}

export async function resetContentSection(section: ContentSection) {
  await contentCollection().updateOne({ _id: "site" }, { $unset: { [section]: "" } });
}
