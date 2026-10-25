import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { getContent } from "./content";
import { listProfessionals } from "./professionals";
import { listRegistrations } from "./registrations";
import { toRegistrationForm } from "./registration-form";

// Totals for the public "Who's coming" section. Only counts leave the server, never names or
// contact details. Cached, and refreshed whenever someone registers (tag "registrations").

export type Count = { label: string; count: number };

export type PublicStats = {
  registrations: number;
  people: number;
  professionals: number;
  wardsReached: number;
  totalWards: number;
  roles: Count[];
  subCounties: Count[];
  days: Count[];
  interests: Count[];
};

// Choices in order of popularity; ties keep the form's order.
function countBy(labels: string[], values: (string | undefined)[], weights?: number[]): Count[] {
  const counts = new Map(labels.map((l) => [l, 0]));
  values.forEach((v, i) => {
    if (v && counts.has(v)) counts.set(v, counts.get(v)! + (weights?.[i] ?? 1));
  });
  return [...counts.entries()].map(([label, count]) => ({ label, count })).sort((a, b) => b.count - a.count);
}

export async function getPublicStats(): Promise<PublicStats | null> {
  "use cache";
  cacheTag("registrations");
  try {
    const [rows, pros, content] = await Promise.all([listRegistrations(), listProfessionals(), getContent()]);
    const form = toRegistrationForm(content);
    const wards = new Set(
      [...rows, ...pros].filter((r) => r.ward).map((r) => `${r.subCounty}|${r.ward}`),
    );
    cacheLife("hours");
    return {
      registrations: rows.length,
      people: rows.reduce((sum, r) => sum + r.groupSize, 0),
      professionals: pros.length,
      wardsReached: wards.size,
      totalWards: Object.values(form.location.wards).reduce((sum, list) => sum + list.length, 0),
      roles: countBy(form.roles, rows.map((r) => r.role)),
      subCounties: countBy(
        form.location.subCounties,
        rows.map((r) => r.subCounty),
        rows.map((r) => r.groupSize),
      ),
      days: form.days.map((d) => ({
        label: d.label.split("—")[0].trim(),
        count: rows.filter((r) => r.days.includes(d.id)).reduce((sum, r) => sum + r.groupSize, 0),
      })),
      interests: countBy(form.interests, rows.flatMap((r) => r.interests)).slice(0, 5),
    };
  } catch (err) {
    console.error("Failed to load registration stats", err);
    cacheLife("minutes");
    return null;
  }
}
