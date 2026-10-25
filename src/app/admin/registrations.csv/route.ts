import { connection } from "next/server";
import { formatPhone, listRegistrations } from "@/lib/registrations";

const columns = [
  ["Registered at (EAT)", (r) => nairobiTime(r.createdAt)],
  ["Name", (r) => r.name],
  ["Phone", (r) => formatPhone(r.phone)],
  ["Email", (r) => r.email],
  ["Role", (r) => r.role],
  ["Sub-county", (r) => r.subCounty],
  ["Institution", (r) => r.institution],
  ["Group size", (r) => String(r.groupSize)],
  ["Day 1", (r) => (r.days.includes("day-1") ? "Yes" : "No")],
  ["Day 2", (r) => (r.days.includes("day-2") ? "Yes" : "No")],
  ["Interests", (r) => r.interests.join("; ")],
  ["Access Hub service", (r) => r.hubService ?? ""],
  ["Access Hub slot", (r) => r.hubSlot ?? ""],
  ["Email updates", (r) => (r.emailUpdates ? "Yes" : "No")],
] as const satisfies readonly (readonly [string, (r: Awaited<ReturnType<typeof listRegistrations>>[number]) => string])[];

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
  const rows = await listRegistrations();
  const lines = [
    columns.map(([label]) => cell(label)).join(","),
    ...rows.map((r) => columns.map(([, get]) => cell(get(r))).join(",")),
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
