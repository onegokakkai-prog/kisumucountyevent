import { z } from "zod";
import type { SiteContent } from "./content";
import { normaliseQuestion, splitLines, type FormQuestion } from "./form-questions";

// The two registration forms as organisers set them up in /admin/form, in the shape the
// forms, their validation and the admin pages use. Built from the stored content on the
// server and passed to the client forms as props.

export type DayId = "day-1" | "day-2";

// Gender, sub-county and then a ward (in Kisumu County) or a region (from outside it).
// Shared by both forms.
export type LocationConfig = {
  labels: { gender: string; subCounty: string; ward: string; region: string };
  showGender: boolean;
  showSubCounty: boolean;
  showWard: boolean;
  genders: string[];
  subCounties: string[];
  wards: Record<string, string[]>;
  regions: string[];
};

export type RegistrationForm = {
  labels: Omit<SiteContent["formFields"], `show${string}`>;
  show: {
    email: boolean;
    institution: boolean;
    groupSize: boolean;
    interests: boolean;
    hub: boolean;
    updates: boolean;
  };
  location: LocationConfig;
  roles: string[];
  rolesWithInstitution: string[];
  days: { id: DayId; label: string }[];
  interests: string[];
  hubServices: string[];
  hubSlots: string[];
  questionsHeading: string;
  questions: FormQuestion[];
};

export type ProfessionalForm = {
  labels: Omit<SiteContent["proForm"], "showGender" | "visitorTab" | "proTab">;
  location: LocationConfig;
  questions: FormQuestion[];
};

export type FormTabs = { visitor: string; professional: string };

type FormContent = Pick<SiteContent, "formFields" | "formOptions" | "formQuestions" | "proForm" | "proQuestions">;

// "Sub-county | Ward" lines -> { "Sub-county": ["Ward", …] }
function parseWards(text: string) {
  const wards: Record<string, string[]> = {};
  for (const line of splitLines(text)) {
    const bar = line.indexOf("|");
    if (bar === -1) continue;
    const subCounty = line.slice(0, bar).trim();
    const ward = line.slice(bar + 1).trim();
    if (subCounty && ward) (wards[subCounty] ??= []).push(ward);
  }
  return wards;
}

function toLocation({ formFields: f, formOptions: o }: FormContent, showGender: boolean): LocationConfig {
  const genders = splitLines(o.genders);
  const subCounties = splitLines(o.subCounties);
  return {
    labels: { gender: f.genderLabel, subCounty: f.subCountyLabel, ward: f.wardLabel, region: f.regionLabel },
    showGender: showGender && genders.length > 0,
    showSubCounty: f.showSubCounty && subCounties.length > 0,
    showWard: f.showWard,
    genders,
    subCounties,
    wards: parseWards(o.wards),
    regions: splitLines(o.regions),
  };
}

// The text settings of a section, without its on/off switches and the named keys.
function textOnly<T extends object, K extends keyof T = never>(section: T, ...drop: K[]) {
  return Object.fromEntries(
    Object.entries(section).filter(([key]) => !key.startsWith("show") && !drop.includes(key as K)),
  ) as Omit<T, `show${string}` | K>;
}

export function toRegistrationForm(content: FormContent): RegistrationForm {
  const { formFields, formOptions, formQuestions } = content;
  const { showEmail, showGender, showInstitution, showGroupSize, showInterests, showHub, showUpdates } = formFields;
  const labels = textOnly(formFields);
  const hubServices = splitLines(formOptions.hubServices);
  const hubSlots = splitLines(formOptions.hubSlots);
  return {
    labels,
    show: {
      email: showEmail,
      institution: showInstitution,
      groupSize: showGroupSize,
      interests: showInterests && splitLines(formOptions.interests).length > 0,
      hub: showHub && hubServices.length > 0 && hubSlots.length > 0,
      // Updates go by email, so the tick box needs the email field.
      updates: showUpdates && showEmail,
    },
    location: toLocation(content, showGender),
    roles: splitLines(formOptions.roles),
    rolesWithInstitution: splitLines(formOptions.rolesWithInstitution),
    days: [
      { id: "day-1", label: formOptions.day1 },
      { id: "day-2", label: formOptions.day2 },
    ],
    interests: splitLines(formOptions.interests),
    hubServices,
    hubSlots,
    questionsHeading: formQuestions.heading,
    questions: formQuestions.items.map(normaliseQuestion),
  };
}

export function toProfessionalForm(content: FormContent): ProfessionalForm {
  return {
    labels: textOnly(content.proForm, "visitorTab", "proTab"),
    // Professionals are always asked where they're from.
    location: { ...toLocation(content, content.proForm.showGender), showSubCounty: true },
    questions: content.proQuestions.items.map(normaliseQuestion),
  };
}

export function toFormTabs({ proForm }: Pick<SiteContent, "proForm">): FormTabs {
  return { visitor: proForm.visitorTab, professional: proForm.proTab };
}

// Wards for the chosen sub-county. None means the person is from outside Kisumu County,
// so they're asked for their region instead.
export function wardsFor(location: LocationConfig, subCounty: string) {
  return location.wards[subCounty] ?? [];
}

export type Location = { gender: string; subCounty: string; ward: string; region: string };

export function readLocation(formData: FormData, location: LocationConfig): Location {
  const text = (key: string) => {
    const v = formData.get(key);
    return typeof v === "string" ? v : "";
  };
  const subCounty = location.showSubCounty ? text("subCounty") : "";
  const wards = wardsFor(location, subCounty);
  const askRegion = location.showSubCounty && subCounty !== "" && wards.length === 0 && location.regions.length > 0;
  return {
    gender: location.showGender ? text("gender") : "",
    subCounty,
    ward: location.showWard && wards.length > 0 ? text("ward") : "",
    region: askRegion ? text("region") : "",
  };
}

const oneOf = (options: string[], message: string) =>
  z.string({ error: message }).refine((v) => options.includes(v), message);

// Zod fields for the location block; parts not asked must be empty.
export function locationShapes(location: LocationConfig, raw: Location) {
  const wards = wardsFor(location, raw.subCounty);
  const askWard = location.showWard && wards.length > 0;
  const askRegion = location.showSubCounty && raw.subCounty !== "" && wards.length === 0 && location.regions.length > 0;
  return {
    gender: location.showGender ? oneOf(location.genders, "Choose an option.") : z.literal(""),
    subCounty: location.showSubCounty ? oneOf(location.subCounties, "Choose your sub-county.") : z.literal(""),
    ward: askWard ? oneOf(wards, "Choose your ward.") : z.literal(""),
    region: askRegion ? oneOf(location.regions, "Choose where you're coming from.") : z.literal(""),
  };
}
