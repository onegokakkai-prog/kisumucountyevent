import { connection } from "next/server";
import { getContent } from "@/lib/content";
import { formatAnswer } from "@/lib/form-questions";
import { formatPhone, listRegistrations, type StoredRegistration } from "@/lib/registrations";

type Column = readonly [string, (r: StoredRegistration) => string];

const columns: Column[] = [
  ["Registered at (EAT)", (r) => nairobiTime(r.createdAt)],
  ["Name", (r) => r.name],
  ["Phone", (r) => formatPhone(r.phone)],
  ["Email", (r) => r.email],
  ["Role", (r) => r.role],
  ["Gender", (r) => r.gender ?? ""],
  ["Sub-county", (r) => r.subCounty],
  ["Ward", (r) => r.ward ?? ""],
  ["County or country (outside Kisumu County)", (r) => r.region ?? ""],
  ["Institution", (r) => r.institution],
  ["Group size", (r) => String(r.groupSize)],
  ["Day 1", (r) => (r.days.includes("day-1") ? "Yes" : "No")],
  ["Day 2", (r) => (r.days.includes("day-2") ? "Yes" : "No")],
  ["Interests", (r) => r.interests.join("; ")],
  ["Access Hub service", (r) => r.hubService ?? ""],
  ["Access Hub slot", (r) => r.hubSlot ?? ""],
  ["Email updates", (r) => (r.emailUpdates ? "Yes" : "No")],
];

// 2026-10-24 11:22 in East Africa Time.
function nairobiTime(date: Date) {
  return date.toLocaleString("sv-SE", { timeZone: "Africa/Nairobi" }).slice(0, 16);
}

// Quote every cell, and stop spreadsheet apps treating text as a formula.
function cell(value: string) {
  const safe = /^[=+\-@\t\r]/.test(value) ? `'${value}` : value;
  return `"${safe.replace(/"/g, '""')}"`;
}

export async function GET() {
  await connection();
  const [rows, content] = await Promise.all([listRegistrations(), getContent()]);
  // One column per extra question currently on the form.
  const all: Column[] = [
    ...columns,
    ...content.formQuestions.items.map((q): Column => [q.label, (r) => formatAnswer(r.answers?.[q.id])]),
  ];
  const lines = [
    all.map(([label]) => cell(label)).join(","),
    ...rows.map((r) => all.map(([, get]) => cell(get(r))).join(",")),
  ];
  const date = new Date().toISOString().slice(0, 10);

  return new Response("\uFEFF" + lines.join("\r\n"), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="festival-registrations-${date}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
