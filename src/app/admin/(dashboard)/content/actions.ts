"use server";

import { updateTag } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin-auth";
import { defaultContent, resetContentSection, saveContentSection, type ContentSection } from "@/lib/content";
import { uploadContentType, uploadKinds, type UploadKind } from "@/lib/media-types";
import { createUploadUrl } from "@/lib/r2";
import { choiceTypes } from "@/lib/form-questions";
import { formSections, proSections, sections, slotFields, type Field, type ItemField } from "./fields";

export type SaveState = { status: "idle" } | { status: "saved"; at: number } | { status: "error"; message: string; at: number };

const url = z
  .string()
  .trim()
  .max(1000)
  .refine((v) => v === "" || v.startsWith("/") || v.startsWith("https://"), "Must be a site path or an https:// link.");

const photosSchema = z
  .array(
    z.object({
      src: url.refine((v) => v !== "", "Every photo needs a file."),
      alt: z.string().trim().min(1, "Describe every photo for people using screen readers.").max(600, "Keep each photo description under 600 characters."),
      caption: z.string().trim().max(1000, "Keep each caption under 1,000 characters."),
      credit: z.string().trim().max(300, "Keep each photo credit under 300 characters.").optional(),
    }),
  )
  .max(40, "Up to 40 photos.");

function readLines(text: string, max: number) {
  return text.split("\n").map((l) => l.trim()).filter(Boolean).slice(0, max);
}

// "Track 2 | Opening ceremony" -> { track: "Track 2", title: "Opening ceremony" }
function readSessions(text: string) {
  return readLines(text, 20).map((line) => {
    const bar = line.indexOf("|");
    return bar === -1 ? { track: "", title: line } : { track: line.slice(0, bar).trim(), title: line.slice(bar + 1).trim() };
  });
}

// Converts one list's submitted rows (plain text from the editor) back into stored items.
function readList(raw: string, fields: ItemField[], max: number, itemName: string) {
  const rows = z.array(z.record(z.string(), z.string())).max(max, `Up to ${max} ${itemName}s.`).parse(JSON.parse(raw || "[]"));
  return rows.map((row, i) => {
    const item: Record<string, unknown> = {};
    for (const f of fields) {
      const v = (row[f.key] ?? "").trim();
      if (f.required && !v) throw new z.ZodError([{ code: "custom", path: [], message: `${itemName[0].toUpperCase()}${itemName.slice(1)} ${i + 1}: add the ${f.label.toLowerCase()}.` }]);
      if (f.type === "id") item[f.key] = /^[a-z0-9]{4,16}$/.test(v) ? v : Math.random().toString(36).slice(2, 10);
      else if (f.type === "lines") item[f.key] = readLines(v, 40);
      else if (f.type === "sessions") item[f.key] = readSessions(v);
      else if (f.type === "image") item[f.key] = url.parse(v);
      else if (f.type === "select") item[f.key] = f.options?.some((o) => o.value === v) ? v : f.options?.[0]?.value;
      else item[f.key] = z.string().max(f.type === "textarea" ? 1000 : 300, `${f.label}: too long.`).parse(v);
    }
    return item;
  });
}

function readField(field: Field, formData: FormData): unknown {
  const raw = formData.get(field.key);
  const text = typeof raw === "string" ? raw : "";
  switch (field.type) {
    case "text":
      return z.string().trim().max(300, `${field.label}: keep it under 300 characters.`).parse(text);
    case "textarea":
      return z.string().trim().max(3000, `${field.label}: keep it under 3,000 characters.`).parse(text);
    case "color":
      return z.string().regex(/^#[0-9a-f]{6}$/i, `${field.label}: choose a colour.`).parse(text);
    case "number": {
      if (text.trim() === "" && field.optional) return null;
      const n = z.coerce.number({ error: `${field.label}: enter a number.` }).int().min(0, `${field.label}: can't be negative.`).parse(text || "0");
      return n;
    }
    case "toggle":
      return raw === "on";
    case "lines":
      return readLines(text, 40).join("\n");
    case "photos":
      return photosSchema.parse(JSON.parse(text || "[]"));
    case "audio":
    case "image":
      return url.parse(text);
    case "list":
      return readList(text, field.item, field.max, field.itemName);
    case "programme":
      return defaultContent.programme.days.map((day, d) => ({
        id: day.id,
        label: z.string().trim().min(1, `Day ${d + 1} needs a tab name.`).max(40).parse(formData.get(`days.${d}.label`) ?? ""),
        intro: z.string().trim().max(300).parse(formData.get(`days.${d}.intro`) ?? ""),
        slots: readList(String(formData.get(`days.${d}.slots`) ?? "[]"), slotFields, 8, "time slot"),
      }));
  }
}

export async function saveSection(section: ContentSection, _prev: SaveState, formData: FormData): Promise<SaveState> {
  await requireAdmin();
  const config = [...sections, ...formSections, ...proSections].find((s) => s.id === section);
  if (!config) return { status: "error", message: "Unknown section.", at: Date.now() };

  const value: Record<string, unknown> = {};
  try {
    for (const field of config.fields) value[field.key] = readField(field, formData);
    if (section === "voiceover") value.duration = z.string().max(10).parse(formData.get("duration") ?? "");
    const problem = checkForm(section, value);
    if (problem) return { status: "error", message: problem, at: Date.now() };
  } catch (err) {
    const message = err instanceof z.ZodError ? err.issues[0].message : "Some of the values couldn't be read.";
    return { status: "error", message, at: Date.now() };
  }

  try {
    await saveContentSection(section, value as never);
  } catch (err) {
    console.error("Failed to save content", err);
    return { status: "error", message: "Couldn't save just now. Please try again.", at: Date.now() };
  }
  updateTag("content");
  return { status: "saved", at: Date.now() };
}

// Checks that keep the registration form usable.
function checkForm(section: ContentSection, value: Record<string, unknown>): string | null {
  if (section === "formOptions") {
    if (!String(value.roles).trim()) return "Add at least one “coming as” choice.";
    if (!String(value.day1).trim() || !String(value.day2).trim()) return "Both day options need a label.";
  }
  if (section === "formQuestions" || section === "proQuestions") {
    const items = value.items as { label: string; type: string; options: string[] }[];
    const missing = items.find((q) => choiceTypes.includes(q.type as never) && q.options.length === 0);
    if (missing) return `“${missing.label}” needs at least one choice, one per line.`;
  }
  return null;
}

export async function resetSection(section: ContentSection) {
  await requireAdmin();
  await resetContentSection(section);
  updateTag("content");
}

export async function getUploadUrl(kind: UploadKind, fileName: string, fileType: string, size: number) {
  await requireAdmin();
  const rules = uploadKinds[kind];
  if (!rules) return { error: "Unsupported upload." } as const;
  const contentType = uploadContentType(kind, fileName, fileType);
  if (!(rules.types as readonly string[]).includes(contentType)) {
    return {
      error: kind === "image" ? "Use a JPG, PNG, WebP or AVIF image." : "Use an MP3/MPEG, M4A, AAC, WAV, OGG or WebM recording.",
    } as const;
  }
  if (size > rules.maxBytes) return { error: `That file is too big. The limit is ${rules.maxBytes / 1024 / 1024} MB.` } as const;
  try {
    return { ...(await createUploadUrl(kind, fileName, contentType)), contentType };
  } catch (err) {
    console.error("Failed to sign upload", err);
    return { error: "Uploads aren't set up yet. Add the R2 settings to the environment." } as const;
  }
}
