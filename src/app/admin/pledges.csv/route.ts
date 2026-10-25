import { connection } from "next/server";
import { listPledges } from "@/lib/pledges";
import { formatPhone } from "@/lib/registrations";

const columns = [
  ["Pledged at (EAT)", (r) => nairobiTime(r.createdAt)],
  ["Name", (r) => r.name],
  ["Phone", (r) => formatPhone(r.phone)],
  ["Email", (r) => r.email],
  ["Amount (KES)", (r) => String(r.amount)],
  ["Bricks", (r) => (r.bricks ? String(r.bricks) : "")],
  ["Status", (r) => (r.status === "received" ? "Received" : "Pledged")],
  ["Message", (r) => r.message],
] as const satisfies readonly (readonly [string, (r: Awaited<ReturnType<typeof listPledges>>[number]) => string])[];

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
  const rows = await listPledges();
  const lines = [
    columns.map(([label]) => cell(label)).join(","),
    ...rows.map((r) => columns.map(([, get]) => cell(get(r))).join(",")),
  ];
  const date = new Date().toISOString().slice(0, 10);

  return new Response("﻿" + lines.join("\r\n"), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="buy-a-brick-pledges-${date}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
