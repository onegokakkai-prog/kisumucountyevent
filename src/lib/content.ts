import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import {
  brickDrive,
  careerOptions,
  festival,
  genders,
  regions,
  wards,
  highlights,
  hubServices,
  hubSlots,
  interests,
  roles,
  rolesWithInstitution,
  subCounties,
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
export type QuestionType = "text" | "textarea" | "number" | "select" | "radio" | "checkboxes" | "yesno";
// "required" and "other" are "yes" / "no". A question with showIfQuestion is only asked when
// the question with that wording was answered with showIfAnswer.
export type FormQuestion = {
  id: string;
  label: string;
  type: QuestionType;
  options: string[];
  required: string;
  other: string;
  help: string;
  showIfQuestion: string;
  showIfAnswer: string;
};

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
  // Registration form wording and which optional parts are shown.
  formFields: {
    rolesHeading: string;
    detailsHeading: string;
    nameLabel: string;
    phoneLabel: string;
    showEmail: boolean;
    emailLabel: string;
    showGender: boolean;
    genderLabel: string;
    showSubCounty: boolean;
    subCountyLabel: string;
    showWard: boolean;
    wardLabel: string;
    regionLabel: string;
    showInstitution: boolean;
    institutionLabel: string;
    showGroupSize: boolean;
    groupSizeLabel: string;
    daysHeading: string;
    showInterests: boolean;
    interestsHeading: string;
    showHub: boolean;
    hubHeading: string;
    hubBody: string;
    hubCheckbox: string;
    hubServiceLabel: string;
    hubSlotLabel: string;
    showUpdates: boolean;
    updatesLabel: string;
    submitLabel: string;
    successBody: string;
  };
  // Answer choices, one per line.
  formOptions: {
    roles: string;
    rolesWithInstitution: string;
    subCounties: string;
    wards: string;
    regions: string;
    genders: string;
    day1: string;
    day2: string;
    interests: string;
    hubServices: string;
    hubSlots: string;
  };
  formQuestions: { heading: string; items: FormQuestion[] };
  // The professionals' form. Location and gender use the visitor form's labels and choices.
  proForm: {
    visitorTab: string;
    proTab: string;
    intro: string;
    detailsHeading: string;
    nameLabel: string;
    phoneLabel: string;
    emailLabel: string;
    showGender: boolean;
    submitLabel: string;
    successBody: string;
  };
  proQuestions: { items: FormQuestion[] };
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
  formFields: {
    rolesHeading: "I'm coming as…",
    detailsHeading: "Your details",
    nameLabel: "Full name",
    phoneLabel: "Mobile number",
    showEmail: true,
    emailLabel: "Email",
    showGender: true,
    genderLabel: "Gender",
    showSubCounty: true,
    subCountyLabel: "Sub-county",
    showWard: true,
    wardLabel: "Ward",
    regionLabel: "Which county or country are you coming from?",
    showInstitution: true,
    institutionLabel: "School or institution",
    showGroupSize: true,
    groupSizeLabel: "Number in your group",
    daysHeading: "Which days?",
    showInterests: true,
    interestsHeading: "What interests you?",
    showHub: true,
    hubHeading: "Access Hub",
    hubBody: "Book ahead to skip the queue at the scholarship desk, EARC screenings or NCPWD registration.",
    hubCheckbox: "Yes, I'd like to book an Access Hub slot",
    hubServiceLabel: "Service",
    hubSlotLabel: "Preferred time",
    showUpdates: true,
    updatesLabel: "Send me festival updates by email",
    submitLabel: "Complete registration",
    successBody:
      "Thank you. The festival team will contact you on {phone} with your entry details and session reminders. See you at Kisumu Central Grounds.",
  },
  formOptions: {
    roles: roles.join("\n"),
    rolesWithInstitution: rolesWithInstitution.join("\n"),
    subCounties: subCounties.join("\n"),
    wards: Object.entries(wards)
      .flatMap(([subCounty, list]) => list.map((ward) => `${subCounty} | ${ward}`))
      .join("\n"),
    regions: regions.join("\n"),
    genders: genders.join("\n"),
    day1: "Day 1 — Opening, Town Hall & constituency debates",
    day2: "Day 2 — CBE keynote, Gubernatorial Debate & Grand Awards",
    interests: interests.join("\n"),
    hubServices: hubServices.join("\n"),
    hubSlots: hubSlots.join("\n"),
  },
  formQuestions: { heading: "A few more questions", items: [] },
  proForm: {
    visitorTab: "Visitors & families",
    proTab: "Professionals",
    intro:
      "Beyond corporate sponsors, the festival relies on Kisumu County's professionals to sponsor learners, retired teachers and activities. Tell us where you're from, your profession and how you'd like to support.",
    detailsHeading: "Your details",
    nameLabel: "Full name",
    phoneLabel: "Mobile number",
    emailLabel: "Email",
    showGender: true,
    submitLabel: "Send my details",
    successBody:
      "Thank you for supporting the festival. The team will contact you on {phone} about sponsorship and volunteering.",
  },
  proQuestions: {
    items: [
      question("profession", "Your profession, in relation to the CBC pathways", "select", careerOptions, {
        required: "yes",
        other: "yes",
        help: "Choose the closest match. Pick Other to type your own.",
      }),
      question(
        "promoting",
        "What are you currently doing to promote education in Kisumu County?",
        "checkboxes",
        [
          "Mentorship programme",
          "Scholarships for children outside my extended family",
          "Scholarships for children within my immediate family",
          "Fundraising for school infrastructure or resources",
          "Professionals' training programmes",
        ],
        { other: "yes" },
      ),
      question(
        "participation",
        "How would you like to take part in the festival?",
        "checkboxes",
        [
          "Sponsorship to the festival (transport, lunch)",
          "Sponsoring 3–5 learners from my community to participate",
          "Sponsoring 5–10 learners to participate",
          "Sponsoring more than 10 learners to participate",
          "Sponsoring 3–5 retired teachers from my community to participate",
          "Sponsoring more than 5 retired teachers to participate",
          "Contributing to the Grace of Mariatta building fund",
          "Sponsorship towards the Retired Teachers and Educators Awards",
        ],
        {},
      ),
      question("volunteer", "Are you available to volunteer to support the organisation of the event?", "yesno", [], {
        required: "yes",
      }),
      question(
        "workingGroups",
        "Which working groups are you interested in?",
        "checkboxes",
        [
          "Logistics",
          "Media & communication",
          "Data analysis for the Town Hall",
          "Career & TVET",
          "Community Education strand",
          "Early Years",
          "AI in education workshop",
          "3 Minute Thesis / research symposium",
          "Fundraising",
        ],
        {
          other: "yes",
          showIfQuestion: "Are you available to volunteer to support the organisation of the event?",
          showIfAnswer: "Yes",
        },
      ),
    ],
  },
  partners: { title: "Brought to you by", items: partners.map(({ role, name, logo }) => ({ role, name, logo })) },
  team: {
    title: "Meet the organising team",
    body: "The people bringing the festival together.",
    items: organisingTeam.map((m) => ({ ...m, bio: "", photo: "" })),
  },
  voiceover,
};

function question(
  id: string,
  label: string,
  type: QuestionType,
  options: readonly string[],
  extra: Partial<Pick<FormQuestion, "required" | "other" | "help" | "showIfQuestion" | "showIfAnswer">>,
): FormQuestion {
  return { id, label, type, options: [...options], required: "no", other: "no", help: "", showIfQuestion: "", showIfAnswer: "", ...extra };
}

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
