import { connection } from "next/server";
import { getContent } from "@/lib/content";
import { formatAnswer, groupOf } from "@/lib/form-questions";
import { listProfessionals, type StoredProfessional } from "@/lib/professionals";
import { formatPhone } from "@/lib/registrations";

type Column = readonly [string, (r: StoredProfessional) => string];

const columns: Column[] = [
  ["Sent at (EAT)", (r) => r.createdAt.toLocaleString("sv-SE", { timeZone: "Africa/Nairobi" }).slice(0, 16)],
  ["Name", (r) => r.name],
  ["Phone", (r) => formatPhone(r.phone)],
  ["Email", (r) => r.email],
  ["Gender", (r) => r.gender],
  ["Sub-county", (r) => r.subCounty],
  ["Ward", (r) => r.ward],
  ["County or country (outside Kisumu County)", (r) => r.region],
];

// Quote every cell, and stop spreadsheet apps treating text as a formula.
function cell(value: string) {
  const safe = /^[=+\-@\t\r]/.test(value) ? `'${value}` : value;
  return `"${safe.replace(/"/g, '""')}"`;
}

export async function GET() {
  await connection();
  const [rows, content] = await Promise.all([listProfessionals(), getContent()]);
  // One column per question; grouped choices (like CBC tracks) get a column for the group too.
  const all: Column[] = [
    ...columns,
    ...content.proQuestions.items.flatMap((q): Column[] => {
      const answer: Column = [q.label, (r) => formatAnswer(r.answers[q.id])];
      const grouped = q.options.some((o) => o.includes("|"));
      if (!grouped || q.type === "checkboxes") return [answer];
      return [answer, [`${q.label} (group)`, (r) => groupOf(q, String(r.answers[q.id] ?? ""))]];
    }),
  ];
  const lines = [all.map(([label]) => cell(label)).join(","), ...rows.map((r) => all.map(([, get]) => cell(get(r))).join(","))];
  const date = new Date().toISOString().slice(0, 10);

  return new Response("﻿" + lines.join("\r\n"), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="festival-professionals-${date}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
