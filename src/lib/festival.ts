// Single source of truth for festival content. Values marked "to confirm" come
// from the concept note and should be updated once the organisers finalise them.

export const festival = {
  name: "Kisumu County Education Festival",
  year: 2026,
  edition: "Inaugural edition",
  theme:
    "Dala ka Dala, Gweng ka Gweng: Igniting Community Action to Transform Education from Early Years to Thriving Careers",
  // to confirm: exact dates
  dateLabel: "Late December 2026",
  dateDetail: "Exact dates to be announced",
  durationLabel: "2 days",
  venue: "Kisumu Central Grounds",
  location: "Kisumu County, Kenya",
  audienceLabel: "3,000+ learners, parents & leaders",
  gates: "Day 1 from 08:00 · Day 2 from 08:30",
  phone: "+254790019403",
  phoneLabel: "+254 790 019 403",
} as const;

export const navLinks = [
  { href: "/#about", label: "About" },
  { href: "/#tracks", label: "Tracks" },
  { href: "/#programme", label: "Programme" },
  { href: "/#access", label: "Scholarships" },
  { href: "/#brick", label: "Buy-a-Brick" },
  { href: "/#partners", label: "Partners" },
  { href: "/#team", label: "Team" },
] as const;

export const continuum = [
  { stage: "ECDE", detail: "Play-based learning & early screenings" },
  { stage: "Primary", detail: "Foundational literacy & numeracy" },
  { stage: "Senior Secondary", detail: "STEM, Social Sciences, Arts & Sports pathways" },
  { stage: "TVET", detail: "Technical & vocational skills" },
  { stage: "University & careers", detail: "From classroom to livelihood" },
] as const;

export type TrackIcon = "medal" | "speech" | "pathways" | "clipboard" | "star";
// Icons organisers can pick for cards in /admin/content.
export const contentIcons = ["medal", "speech", "pathways", "clipboard", "star", "cap", "person", "card", "phone"] as const;
export type ContentIcon = (typeof contentIcons)[number];
export type TrackTone = "light" | "dark" | "sun";

export const tracks: {
  number: string;
  title: string;
  activities: string[];
  icon: TrackIcon;
  tone: TrackTone;
}[] = [
  {
    number: "1",
    title: "Education Hall of Fame & Heritage",
    activities: ["Intergenerational educators circles", "Retired educators and teachers awards"],
    icon: "medal",
    tone: "light",
  },
  {
    number: "2",
    title: "Leadership, Policy & Governance",
    activities: [
      "Kisumu County Education Town Hall",
      "Chiefs' “Baraza as a Classroom” workshops",
      "MP and gubernatorial candidates' education debates",
    ],
    icon: "speech",
    tone: "dark",
  },
  {
    number: "3",
    title: "CBE Pathways, Pedagogy & Assistive Tech",
    activities: [
      "Senior Secondary pathway clinics (STEM, Social Sciences, Arts/Sports, SNE)",
      "Foundational literacy and numeracy demonstrations",
      "Assistive technology pavilions",
    ],
    icon: "pathways",
    tone: "light",
  },
  {
    number: "4",
    title: "Scholarship, EARC & NCPWD Access Hub",
    activities: [
      "Bursary and scholarship applications",
      "Mobile EARC developmental screenings for ages 3–8",
      "Official NCPWD disability registration",
    ],
    icon: "clipboard",
    tone: "light",
  },
  {
    number: "5 & 6",
    title: "Grace of Mariatta Drive, TVET & Youth Innovation",
    activities: [
      "“Little Explorers” Early Years Zone",
      "Mathematics Kangaroo & Economics Olympiad mini competitions",
      "TVET skills pavilion",
      "3 Minute Thesis & researcher/teacher circles",
      "Day 2 awards",
    ],
    icon: "star",
    tone: "sun",
  },
];

export type Session = { track: string; title: string };
export type Slot = { label: string; time: string; main: Session[]; hubs: Session[] };
export type FestivalDay = { id: "day-1" | "day-2"; label: string; intro: string; slots: Slot[] };

export const programme: FestivalDay[] = [
  {
    id: "day-1",
    label: "Day 1",
    intro: "Opening, the State of Kisumu County Education Town Hall, and constituency candidates' debates.",
    slots: [
      {
        label: "Morning",
        time: "08:00 – 12:30",
        main: [
          { track: "Track 1", title: "Grand Opening & Hall of Fame Unveiling" },
          {
            track: "Track 2",
            title: "State of Kisumu County Education Town Hall — ECDE, FLN, infrastructure & transition data",
          },
          { track: "Track 2", title: "Chiefs' “Baraza as a Classroom” capacity workshop" },
        ],
        hubs: [
          { track: "Track 3", title: "CBE Pathway, Play-Based Pedagogy & Assistive Tech Expo" },
          { track: "Track 4", title: "Scholarship application & bursary desk" },
          { track: "Track 4", title: "Mobile EARC developmental screenings" },
          { track: "Tracks 5 & 6", title: "Mariatta Support Drive launch & “Little Explorers” Zone" },
          { track: "Tracks 5 & 6", title: "3 Minute Thesis research symposium" },
        ],
      },
      {
        label: "Midday",
        time: "12:30 – 14:30",
        main: [
          {
            track: "Track 2",
            title: "Kisumu County Education Alumni & Leaders Luncheon — county priorities & the Community Education Charter",
          },
        ],
        hubs: [{ track: "All hubs", title: "Open walk-in consultations, exhibition hubs & scholarship desk" }],
      },
      {
        label: "Afternoon",
        time: "14:30 – 18:00",
        main: [
          {
            track: "Track 2",
            title: "Constituency-based Parliamentary candidates' debates — sub-county priorities & bursary governance",
          },
        ],
        hubs: [
          { track: "Track 4", title: "Bursary & scholarship application processing" },
          { track: "Track 5", title: "Cultural Gala & fundraiser kickoff" },
          { track: "Track 6", title: "Storytelling, puppet shows & student competition heats" },
        ],
      },
    ],
  },
  {
    id: "day-2",
    label: "Day 2",
    intro: "CBE keynote, competition finals, the Gubernatorial Debate and the Grand Awards.",
    slots: [
      {
        label: "Morning",
        time: "08:30 – 13:00",
        main: [
          { track: "Track 3", title: "Senior Secondary CBE keynote & parent Q&A" },
          {
            track: "Track 6",
            title: "Inter-school Innovation Hackathon & competition finals — Math Kangaroo & Economics Olympiad",
          },
        ],
        hubs: [
          { track: "Track 3", title: "Live SNE & mainstream TVET skill demonstrations" },
          { track: "Track 4", title: "Scholarship application & bursary desk" },
          { track: "Track 4", title: "On-site NCPWD disability registrations & screenings" },
        ],
      },
      {
        label: "Afternoon",
        time: "14:00 – 18:00",
        main: [
          { track: "Track 2", title: "Flagship Kisumu County Gubernatorial Candidates' Education Debate" },
          { track: "Track 6", title: "Inclusive Youth Talent Showcase" },
          {
            track: "Tracks 1, 2 & 6",
            title: "Grand Award Presentations — Retired Teachers and Educators Awards & student winners",
          },
          { track: "Track 5", title: "Grace of Mariatta fundraiser handover & closing" },
        ],
        hubs: [{ track: "Track 4", title: "Final scholarship processing & Access Hub closing" }],
      },
    ],
  },
];

export const highlights = [
  {
    when: "Day 2 · Afternoon",
    title: "The Gubernatorial Education Debate",
    description:
      "Kisumu County's gubernatorial candidates face the public on education — with signed manifestos and roadmaps as the outcome.",
    icon: "speech",
  },
  {
    when: "Day 1 opening → Day 2 awards",
    title: "Retired Teachers and Educators Awards",
    description: "70+ retired teachers and educators honoured for a lifetime of service to Kisumu County's classrooms.",
    icon: "medal",
  },
  {
    when: "Both days",
    title: "“Little Explorers” Early Years Zone",
    description: "Read-a-thons, storytelling, puppet shows and expressive arts for ECDE and Grade 1–3 learners.",
    icon: "star",
  },
] as const satisfies readonly { when: string; title: string; description: string; icon: TrackIcon }[];

export const accessServices = [
  {
    title: "Scholarship & bursary desk",
    description: "Continuous application support and processing across both days.",
    icon: "cap",
  },
  {
    title: "EARC developmental screenings",
    description: "Mobile Educational Assessment & Resource Centre screenings for children aged 3–8.",
    icon: "person",
  },
  {
    title: "NCPWD disability registration",
    description: "Official on-site registration with the National Council for Persons with Disabilities.",
    icon: "card",
  },
] as const;

// to confirm: Buy-a-Brick pricing and progress. Leave null until the organisers
// publish real figures; the section then shows a "launching soon" message.
export const brickDrive: { pricePerBrick: number | null; raised: number | null; target: number | null } = {
  pricePerBrick: null,
  raised: null,
  target: null,
};

export const outcomes = [
  { value: "500+", label: "ECDE & primary learners in read-a-thons, arts and screenings" },
  { value: "1,500+", label: "Parents & students guided on Senior Secondary pathways" },
  { value: "200+", label: "SNE assessments carried out" },
  { value: "100+", label: "Local chiefs equipped to champion education" },
  { value: "70+", label: "Retired teachers & educators honoured" },
] as const;

export const partners = [
  {
    role: "Key implementors",
    name: "County Government of Kisumu & County Education Board",
    logo: "/partners/county-kisumu.jpg",
    width: 199,
    height: 148,
  },
  {
    role: "Technical & fundraising partner",
    name: "Mary J Oasis for Education",
    logo: "/partners/mary-j-oasis.png",
    width: 279,
    height: 259,
  },
  {
    role: "Media partner",
    name: "Jowi 98.1 FM",
    logo: "/partners/jowi-fm.jpg",
    width: 262,
    height: 175,
  },
] as const;

// to confirm: the organisers' names and photos. Placeholders until the team list is shared;
// edit them from /admin/content.
export const organisingTeam = [
  { name: "To be announced", role: "Festival convener" },
  { name: "To be announced", role: "Programme lead" },
  { name: "To be announced", role: "Partnerships & fundraising" },
  { name: "To be announced", role: "Communications & media" },
  { name: "To be announced", role: "Logistics & volunteers" },
  { name: "To be announced", role: "Access Hub coordinator" },
] as const;

export const roles = [
  "Parent / guardian",
  "Student",
  "Teacher / educator",
  "Retired educator",
  "Chief / sub-chief",
  "Alumni",
  "Exhibitor / partner",
  "Media",
] as const;

export const rolesWithInstitution: readonly (typeof roles)[number][] = [
  "Student",
  "Teacher / educator",
  "Exhibitor / partner",
];

export const subCounties = [
  "Kisumu Central",
  "Kisumu East",
  "Kisumu West",
  "Seme",
  "Nyando",
  "Muhoroni",
  "Nyakach",
  "Outside Kisumu County",
] as const;

// Kisumu County's 35 electoral wards, by sub-county (IEBC).
export const wards: Record<string, string[]> = {
  "Kisumu Central": ["Railways", "Migosi", "Shaurimoyo Kaloleni", "Market Milimani", "Kondele", "Nyalenda B"],
  "Kisumu East": ["Kajulu", "Kolwa East", "Manyatta B", "Nyalenda A", "Kolwa Central"],
  "Kisumu West": ["South West Kisumu", "Central Kisumu", "Kisumu North", "West Kisumu", "North West Kisumu"],
  Seme: ["West Seme", "Central Seme", "East Seme", "North Seme"],
  Nyando: ["East Kano/Wawidhi", "Awasi/Onjiko", "Ahero", "Kabonyo/Kanyagwal", "Kobura"],
  Muhoroni: ["Miwani", "Ombeyi", "Masogo/Nyang'oma", "Chemelil", "Muhoroni/Koru"],
  Nyakach: ["South West Nyakach", "North Nyakach", "Central Nyakach", "West Nyakach", "South East Nyakach"],
};

// Asked instead of a ward when someone comes from outside Kisumu County. Lake Region
// Economic Bloc counties first, then the rest.
export const regions = [
  "Siaya County",
  "Homa Bay County",
  "Migori County",
  "Kisii County",
  "Nyamira County",
  "Kakamega County",
  "Vihiga County",
  "Busia County",
  "Bungoma County",
  "Kericho County",
  "Bomet County",
  "Nandi County",
  "Trans Nzoia County",
  "Nairobi County",
  "Another county in Kenya",
  "Uganda",
  "Tanzania",
  "Another country",
] as const;

export const genders = ["Female", "Male", "Prefer not to say"] as const;

export const cbcPathways = ["STEM", "Social Sciences", "Arts & Sports Science", "TVET"] as const;

// Careers grouped by the pathway they best fall in ("Pathway | Career").
export const careerOptions = [
  "STEM | Medicine & health (doctor, nurse, clinical officer)",
  "STEM | Pharmacy & laboratory science",
  "STEM | Scientific research",
  "STEM | Engineering",
  "STEM | ICT & software",
  "STEM | Agriculture & agribusiness",
  "STEM | Food science & nutrition",
  "STEM | Environment & conservation",
  "STEM | Construction & built environment",
  "Social Sciences | Teaching & education",
  "Social Sciences | Business, finance & accounting",
  "Social Sciences | Law & governance",
  "Social Sciences | Public service & administration",
  "Social Sciences | Community & social work",
  "Social Sciences | Media & journalism",
  "Social Sciences | Languages & translation",
  "Social Sciences | Religion & ministry",
  "Arts & Sports Science | Music, drama & film",
  "Arts & Sports Science | Visual arts & design",
  "Arts & Sports Science | Sports, coaching & fitness",
  "TVET | Mechanics & motor vehicle",
  "TVET | Electrical & plumbing",
  "TVET | Building & carpentry",
  "TVET | Fashion, beauty & hairdressing",
  "TVET | Hospitality & catering",
];

export const interests = [
  "Retired Teachers and Educators Awards",
  "Town Hall & candidates' debates",
  "CBE Senior Secondary pathway clinics",
  "Assistive tech & SNE",
  "TVET pavilions & hackathon",
  "“Little Explorers” Early Years Zone",
  "Intergenerational educators' conversation",
  "3 Minute Thesis & teacher-researcher circles",
  "Student mini competition",
  "Community education workshops: entrepreneurs, health & farmers",
  "AI in education workshop",
  "Chiefs' barazas as “classroom” workshops",
] as const;

export const hubServices = [
  "Scholarship / bursary application",
  "EARC screening (child aged 3–8)",
  "NCPWD disability registration",
] as const;

export const hubSlots = ["Day 1 — morning", "Day 1 — afternoon", "Day 2 — morning", "Day 2 — afternoon"] as const;

// Placeholder voiceover generated with text-to-speech; swap in the organisers' recording
// (an .mp3 keeps it light on mobile data) and update the duration.
export const voiceover = {
  src: "/voiceover/festival-message.wav",
  title: "Hear from the organisers",
  duration: "0:25",
};

// Filler photos from Wikimedia Commons until the organisers share their own preparation
// photos. Replace the files in /public/preparation and drop the credits.
export type Photo = { src: string; alt: string; caption: string; credit?: string };

export const preparationPhotos: Photo[] = [
  {
    src: "/preparation/prep-1.jpg",
    alt: "A teacher leans in to help pupils at a computer in a school library",
    caption: "Teacher workshops ahead of the CBE pathway clinics",
    credit: "Queen Asali, CC BY-SA 4.0",
  },
  {
    src: "/preparation/prep-2.jpg",
    alt: "Three young men around a table comparing notes on their phones",
    caption: "Planning session with the organising team",
    credit: "Queen Asali, CC BY-SA 4.0",
  },
  {
    src: "/preparation/prep-3.jpg",
    alt: "A large group of pupils in blue uniforms gathered outside their school",
    caption: "Schools across the county signing up",
    credit: "USAID in Africa, public domain",
  },
  {
    src: "/preparation/prep-4.jpg",
    alt: "A teacher guides a smiling pupil working at a desktop computer",
    caption: "Trialling the assistive tech pavilion",
    credit: "Nduati.githae, CC BY-SA 4.0",
  },
  {
    src: "/preparation/prep-5.jpg",
    alt: "A boat on Lake Victoria at sunset, seen from Kisumu",
    caption: "Kisumu, our host county",
    credit: "Josep M. Gracia, CC BY-SA 4.0",
  },
  {
    src: "/preparation/prep-6.jpg",
    alt: "Pupils seated in rows listening to a teacher in a school library",
    caption: "Briefing learners on the festival tracks",
    credit: "Queen Asali, CC BY-SA 4.0",
  },
  {
    src: "/preparation/prep-7.jpg",
    alt: "Girls in sports kit racing across a grass field",
    caption: "Inter-school games building up to the festival",
    credit: "Onlyonestef, CC BY-SA 4.0",
  },
];
