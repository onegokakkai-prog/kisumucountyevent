import type { ContentSection } from "@/lib/content";
import type { ContentIcon, TrackTone } from "@/lib/festival";
import { questionTypes } from "@/lib/form-questions";

// Describes every editable part of the site. The editor renders forms from this, and the
// save action uses it to read and validate what was submitted.

// A field inside one item of a list (a partner, a highlight, a programme slot…). An "id"
// field is hidden and filled in automatically, so stored answers stay linked to the item.
export type ItemField = {
  key: string;
  label: string;
  type: "text" | "textarea" | "image" | "select" | "lines" | "sessions" | "id";
  required?: boolean;
  options?: readonly { value: string; label: string }[];
  help?: string;
};

export type Field =
  | { key: string; label: string; type: "text" | "textarea" | "color"; help?: string }
  | { key: string; label: string; type: "toggle"; help?: string }
  | { key: string; label: string; type: "number"; optional?: boolean; help?: string }
  | { key: string; label: string; type: "lines"; help?: string }
  | { key: string; label: string; type: "photos" | "audio" | "programme"; help?: string }
  | { key: string; label: string; type: "list"; item: ItemField[]; itemName: string; max: number; help?: string };

const iconOptions = [
  { value: "star", label: "Star" },
  { value: "medal", label: "Medal" },
  { value: "speech", label: "Speech bubble" },
  { value: "pathways", label: "Bar chart" },
  { value: "clipboard", label: "Clipboard" },
  { value: "cap", label: "Graduation cap" },
  { value: "person", label: "Person" },
  { value: "card", label: "ID card" },
  { value: "phone", label: "Phone" },
] as const satisfies readonly { value: ContentIcon; label: string }[];

const toneOptions = [
  { value: "light", label: "White card" },
  { value: "dark", label: "Navy card" },
  { value: "sun", label: "Yellow card" },
] as const satisfies readonly { value: TrackTone; label: string }[];

export const slotFields: ItemField[] = [
  { key: "label", label: "Name", type: "text", required: true, help: "e.g. Morning" },
  { key: "time", label: "Time", type: "text", help: "e.g. 08:00 – 12:30" },
  { key: "main", label: "Main stage & plenary", type: "sessions", help: "One session per line, as Track | Title" },
  { key: "hubs", label: "Hubs & clinics", type: "sessions", help: "One session per line, as Track | Title" },
];

// The settings for one organiser-defined question, in both forms.
const questionItemFields: ItemField[] = [
  { key: "id", label: "Id", type: "id" },
  { key: "label", label: "Question", type: "text", required: true },
  { key: "type", label: "Answer type", type: "select", options: questionTypes },
  {
    key: "required",
    label: "Must answer?",
    type: "select",
    options: [
      { value: "no", label: "Optional" },
      { value: "yes", label: "Required" },
    ],
  },
  {
    key: "options",
    label: "Choices",
    type: "lines",
    help: "For Dropdown, Choose one and Tick all that apply: one per line. Write Group | Choice to group them, e.g. STEM · Pure Sciences | Engineering.",
  },
  {
    key: "other",
    label: "Add an “Other” choice?",
    type: "select",
    options: [
      { value: "no", label: "No" },
      { value: "yes", label: "Yes, with a box to type in" },
    ],
  },
  { key: "help", label: "Hint under the question", type: "text" },
  {
    key: "showIfQuestion",
    label: "Only ask after this question…",
    type: "text",
    help: "Copy the other question's wording exactly. Leave empty to always ask.",
  },
  { key: "showIfAnswer", label: "…is answered with", type: "text", help: "e.g. Yes" },
];

export type SectionConfig = { id: ContentSection; title: string; description: string; fields: Field[] };

export const sections: SectionConfig[] = [
  {
    id: "colors",
    title: "Colours",
    description: "The main colours used across the site. Keep enough contrast between text and backgrounds.",
    fields: [
      { key: "navy", label: "Navy: headers, main text and dark sections", type: "color" },
      { key: "sun", label: "Sun: buttons and highlights", type: "color" },
      { key: "lake", label: "Lake: hovers and the wave in the hero", type: "color" },
      { key: "rust", label: "Rust: small labels and error messages", type: "color" },
      { key: "mist", label: "Mist: light section backgrounds", type: "color" },
    ],
  },
  {
    id: "festival",
    title: "Festival details",
    description: "The name, dates and contact details shown in the header, hero, footer and registration section.",
    fields: [
      { key: "name", label: "Festival name", type: "text" },
      { key: "theme", label: "Tagline under the name", type: "textarea" },
      { key: "dateLabel", label: "Dates", type: "text", help: "For example: 18–19 December 2026" },
      { key: "dateDetail", label: "Dates note", type: "text" },
      { key: "venue", label: "Venue", type: "text" },
      { key: "gates", label: "Gate opening times", type: "text" },
      { key: "phone", label: "Phone number for links", type: "text", help: "International format, e.g. +254790019403" },
      { key: "phoneLabel", label: "Phone number as shown", type: "text", help: "e.g. +254 790 019 403" },
    ],
  },
  {
    id: "voiceover",
    title: "Voiceover",
    description: "The recording visitors can play from the top of the home page. MP3 keeps it light on mobile data.",
    fields: [
      { key: "src", label: "Recording", type: "audio" },
      { key: "title", label: "Player label", type: "text" },
    ],
  },
  {
    id: "about",
    title: "About",
    description: "The first section under the hero.",
    fields: [
      { key: "title", label: "Heading", type: "text" },
      { key: "body", label: "Paragraph", type: "textarea" },
    ],
  },
  {
    id: "preparation",
    title: "Preparation photos",
    description: "The “Road to the festival” photo section. Remove every photo to hide the section.",
    fields: [
      { key: "eyebrow", label: "Small label", type: "text" },
      { key: "title", label: "Heading", type: "text" },
      { key: "body", label: "Paragraph", type: "textarea" },
      { key: "photos", label: "Photos", type: "photos", help: "The first photo is shown large. Five are shown at once." },
    ],
  },
  {
    id: "tracks",
    title: "Festival tracks",
    description: "The track cards. A “Not sure where to start?” card always follows them.",
    fields: [
      { key: "eyebrow", label: "Small label", type: "text" },
      { key: "title", label: "Heading", type: "text" },
      {
        key: "items",
        label: "Tracks",
        type: "list",
        itemName: "track",
        max: 9,
        item: [
          { key: "number", label: "Number", type: "text", required: true, help: "e.g. 1, or 5 & 6" },
          { key: "title", label: "Title", type: "text", required: true },
          { key: "activities", label: "Activities", type: "lines", help: "One per line; shown as bullet points." },
          { key: "icon", label: "Icon", type: "select", options: iconOptions },
          { key: "tone", label: "Card style", type: "select", options: toneOptions },
        ],
      },
    ],
  },
  {
    id: "programme",
    title: "Programme",
    description: "The two-day schedule. Each day has time slots with main-stage sessions and hub sessions.",
    fields: [
      { key: "eyebrow", label: "Small label", type: "text" },
      { key: "title", label: "Heading", type: "text" },
      { key: "days", label: "Days", type: "programme" },
    ],
  },
  {
    id: "highlights",
    title: "Highlights",
    description: "The dark “moments you won’t want to miss” section.",
    fields: [
      { key: "title", label: "Heading", type: "text" },
      {
        key: "items",
        label: "Highlights",
        type: "list",
        itemName: "highlight",
        max: 6,
        item: [
          { key: "when", label: "When", type: "text", help: "e.g. Day 2 · Afternoon" },
          { key: "title", label: "Title", type: "text", required: true },
          { key: "description", label: "Description", type: "textarea" },
          { key: "icon", label: "Icon (shown when there’s no photo)", type: "select", options: iconOptions },
          { key: "image", label: "Photo (optional)", type: "image" },
        ],
      },
    ],
  },
  {
    id: "outcomes",
    title: "Outcomes",
    description: "The big numbers: what the festival sets out to achieve.",
    fields: [
      { key: "title", label: "Heading", type: "text" },
      {
        key: "items",
        label: "Numbers",
        type: "list",
        itemName: "number",
        max: 10,
        item: [
          { key: "value", label: "Number", type: "text", required: true, help: "e.g. 500+" },
          { key: "label", label: "What it counts", type: "textarea", required: true },
        ],
      },
    ],
  },
  {
    id: "access",
    title: "Access Hub",
    description: "The support services section.",
    fields: [
      { key: "eyebrow", label: "Small label", type: "text" },
      { key: "title", label: "Heading", type: "text" },
      { key: "body", label: "Paragraph", type: "textarea" },
      {
        key: "items",
        label: "Service cards",
        type: "list",
        itemName: "service",
        max: 8,
        item: [
          { key: "title", label: "Title", type: "text", required: true },
          { key: "description", label: "Description", type: "textarea" },
          { key: "icon", label: "Icon", type: "select", options: iconOptions },
        ],
      },
    ],
  },
  {
    id: "brick",
    title: "Buy-a-Brick",
    description: "The fundraising section and the pledge form’s payment instructions.",
    fields: [
      { key: "eyebrow", label: "Small label", type: "text" },
      { key: "title", label: "Heading", type: "text" },
      { key: "body", label: "Paragraph", type: "textarea" },
      { key: "pricePerBrick", label: "Price of one brick (KES)", type: "number", optional: true, help: "Leave empty to let people pledge any amount." },
      { key: "target", label: "Fundraising goal (KES)", type: "number", optional: true, help: "Leave empty to hide the progress bar." },
      {
        key: "raisedOffline",
        label: "Raised outside the website (KES)",
        type: "number",
        help: "Added to pledges marked as received to give the total shown on the site.",
      },
      { key: "paybill", label: "M-Pesa Paybill number", type: "text", help: "Leave empty until the Paybill is ready." },
      { key: "account", label: "Account number", type: "text" },
      { key: "instructions", label: "How to pay", type: "lines", help: "One step per line." },
    ],
  },
  {
    id: "partners",
    title: "Partners",
    description: "The partner logos section.",
    fields: [
      { key: "title", label: "Heading", type: "text" },
      {
        key: "items",
        label: "Partners",
        type: "list",
        itemName: "partner",
        max: 12,
        item: [
          { key: "logo", label: "Logo", type: "image" },
          { key: "name", label: "Name", type: "text", required: true },
          { key: "role", label: "Role", type: "text", help: "e.g. Media partner" },
        ],
      },
    ],
  },
  {
    id: "team",
    title: "Organising team",
    description: "The pull-down list of organisers under the partners. Remove everyone to hide it.",
    fields: [
      { key: "title", label: "Pull-down label", type: "text" },
      { key: "body", label: "Line under the label", type: "text" },
      {
        key: "items",
        label: "Team members",
        type: "list",
        itemName: "team member",
        max: 30,
        item: [
          { key: "photo", label: "Photo (optional)", type: "image" },
          { key: "name", label: "Name", type: "text", required: true },
          { key: "role", label: "Role", type: "text", help: "e.g. Programme lead" },
          { key: "bio", label: "Short description", type: "textarea", help: "One or two sentences about them." },
        ],
      },
    ],
  },
];

// The registration form, edited on its own admin page.
export const formSections: SectionConfig[] = [
  {
    id: "register",
    title: "Heading",
    description: "The heading and paragraph above the registration form.",
    fields: [
      { key: "title", label: "Heading", type: "text" },
      { key: "body", label: "Paragraph", type: "textarea" },
    ],
  },
  {
    id: "formFields",
    title: "Questions & wording",
    description:
      "Rename any question and turn optional parts on or off. Name, mobile number, “coming as” and days are always asked: the phone number stops people registering twice.",
    fields: [
      { key: "rolesHeading", label: "“Coming as” question", type: "text" },
      { key: "detailsHeading", label: "Details heading", type: "text" },
      { key: "nameLabel", label: "Name label", type: "text" },
      { key: "phoneLabel", label: "Mobile number label", type: "text" },
      { key: "showEmail", label: "Ask for email (optional for visitors)", type: "toggle" },
      { key: "emailLabel", label: "Email label", type: "text" },
      { key: "showGender", label: "Ask for gender", type: "toggle" },
      { key: "genderLabel", label: "Gender label", type: "text" },
      { key: "showSubCounty", label: "Ask for sub-county (required)", type: "toggle" },
      { key: "subCountyLabel", label: "Sub-county label", type: "text" },
      { key: "showWard", label: "Ask for ward", type: "toggle", help: "Lists the wards of the sub-county they choose." },
      { key: "wardLabel", label: "Ward label", type: "text" },
      {
        key: "regionLabel",
        label: "Question for people from outside Kisumu County",
        type: "text",
        help: "Asked instead of a ward when the sub-county they choose has no wards listed, like “Outside Kisumu County”.",
      },
      {
        key: "showInstitution",
        label: "Ask for school or institution",
        type: "toggle",
        help: "Only shown for the roles listed under Answer choices.",
      },
      { key: "institutionLabel", label: "School or institution label", type: "text" },
      { key: "showGroupSize", label: "Ask for group size", type: "toggle" },
      { key: "groupSizeLabel", label: "Group size label", type: "text" },
      { key: "daysHeading", label: "Days question", type: "text" },
      { key: "showInterests", label: "Ask what interests them", type: "toggle" },
      { key: "interestsHeading", label: "Interests question", type: "text" },
      { key: "showHub", label: "Offer Access Hub booking", type: "toggle" },
      { key: "hubHeading", label: "Access Hub heading", type: "text" },
      { key: "hubBody", label: "Access Hub paragraph", type: "textarea" },
      { key: "hubCheckbox", label: "Access Hub tick box", type: "text" },
      { key: "hubServiceLabel", label: "Access Hub service label", type: "text" },
      { key: "hubSlotLabel", label: "Access Hub time label", type: "text" },
      { key: "showUpdates", label: "Offer email updates", type: "toggle", help: "Needs the email question turned on." },
      { key: "updatesLabel", label: "Email updates tick box", type: "text" },
      { key: "submitLabel", label: "Submit button", type: "text" },
      {
        key: "successBody",
        label: "Message after registering",
        type: "textarea",
        help: "{phone} is replaced with the number they entered.",
      },
    ],
  },
  {
    id: "formOptions",
    title: "Answer choices",
    description:
      "The choices people pick from. One per line; the order here is the order on the form. Gender, sub-counties, wards and regions are used by both forms.",
    fields: [
      { key: "roles", label: "“Coming as” choices", type: "lines" },
      {
        key: "rolesWithInstitution",
        label: "Roles asked for their school or institution",
        type: "lines",
        help: "Copy each one exactly as written above.",
      },
      { key: "genders", label: "Gender choices", type: "lines" },
      { key: "subCounties", label: "Sub-counties", type: "lines" },
      { key: "wards", label: "Wards", type: "lines", help: "One per line as Sub-county | Ward, using the sub-county names above." },
      { key: "regions", label: "Counties and countries (outside Kisumu County)", type: "lines" },
      { key: "day1", label: "Day 1 option", type: "text" },
      { key: "day2", label: "Day 2 option", type: "text" },
      { key: "interests", label: "Interests", type: "lines" },
      { key: "hubServices", label: "Access Hub services", type: "lines" },
      { key: "hubSlots", label: "Access Hub times", type: "lines" },
    ],
  },
  {
    id: "formQuestions",
    title: "Extra questions",
    description:
      "Add your own questions. They appear as one step after the interests, and the answers show in Registrations and the CSV download.",
    fields: [
      { key: "heading", label: "Step heading", type: "text" },
      {
        key: "items",
        label: "Questions",
        type: "list",
        itemName: "question",
        max: 20,
        item: questionItemFields,
      },
    ],
  },
];

// The professionals' form, edited on the same admin page.
export const proSections: SectionConfig[] = [
  {
    id: "proForm",
    title: "Wording",
    description:
      "The professionals' form sits in a second tab beside the visitor form. Share /professionals to open it directly. Sub-county, ward and region use the labels and choices from the visitor form.",
    fields: [
      { key: "visitorTab", label: "Visitor tab name", type: "text" },
      { key: "proTab", label: "Professionals tab name", type: "text" },
      { key: "intro", label: "Introduction", type: "textarea" },
      { key: "detailsHeading", label: "Details heading", type: "text" },
      { key: "nameLabel", label: "Name label", type: "text" },
      { key: "phoneLabel", label: "Mobile number label", type: "text" },
      { key: "emailLabel", label: "Email label", type: "text" },
      { key: "showGender", label: "Ask for gender", type: "toggle" },
      { key: "submitLabel", label: "Submit button", type: "text" },
      { key: "successBody", label: "Message after sending", type: "textarea", help: "{phone} is replaced with the number they entered." },
    ],
  },
  {
    id: "proQuestions",
    title: "Questions",
    description: "Each question is its own step, after their details. Answers show on the Professionals page and in its CSV download.",
    fields: [
      {
        key: "items",
        label: "Questions",
        type: "list",
        itemName: "question",
        max: 20,
        item: questionItemFields,
      },
    ],
  },
];
