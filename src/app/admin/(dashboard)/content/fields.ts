import type { ContentSection } from "@/lib/content";
import type { ContentIcon, TrackTone } from "@/lib/festival";

// Describes every editable part of the site. The editor renders forms from this, and the
// save action uses it to read and validate what was submitted.

// A field inside one item of a list (a partner, a highlight, a programme slot…).
export type ItemField = {
  key: string;
  label: string;
  type: "text" | "textarea" | "image" | "select" | "lines" | "sessions";
  required?: boolean;
  options?: readonly { value: string; label: string }[];
  help?: string;
};

export type Field =
  | { key: string; label: string; type: "text" | "textarea" | "color"; help?: string }
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
    id: "register",
    title: "Registration",
    description: "The heading above the registration form.",
    fields: [
      { key: "title", label: "Heading", type: "text" },
      { key: "body", label: "Paragraph", type: "textarea" },
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
