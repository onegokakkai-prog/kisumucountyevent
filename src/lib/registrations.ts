import "server-only";
import { MongoServerError, type Collection } from "mongodb";
import type { Registration } from "@/app/register/schema";
import { getDb } from "./mongodb";

export type StoredRegistration = Registration & { createdAt: Date };

let indexesReady: Promise<unknown> | undefined;

async function registrations(): Promise<Collection<StoredRegistration>> {
  const collection = getDb().collection<StoredRegistration>("registrations");
  // One registration per phone number; group sizes cover families and school groups.
  indexesReady ??= collection
    .createIndexes([{ key: { phone: 1 }, unique: true }, { key: { createdAt: -1 } }])
    .catch((err) => {
      indexesReady = undefined;
      throw err;
    });
  await indexesReady;
  return collection;
}

// 0712345678, +254712345678 and 254712345678 are the same number.
export function normalisePhone(phone: string): string {
  return phone.replace(/^\+/, "").replace(/^0/, "254");
}

// 254712345678 -> 0712 345 678, readable and kept as text by spreadsheet apps.
export function formatPhone(phone: string): string {
  const local = phone.replace(/^254/, "0");
  return `${local.slice(0, 4)} ${local.slice(4, 7)} ${local.slice(7)}`;
}

export async function saveRegistration(
  registration: Registration,
): Promise<{ ok: true } | { ok: false; reason: "duplicate" }> {
  const collection = await registrations();
  try {
    await collection.insertOne({
      ...registration,
      phone: normalisePhone(registration.phone),
      createdAt: new Date(),
    });
    return { ok: true };
  } catch (err) {
    if (err instanceof MongoServerError && err.code === 11000) return { ok: false, reason: "duplicate" };
    throw err;
  }
}

export async function listRegistrations(): Promise<StoredRegistration[]> {
  const collection = await registrations();
  return collection.find({}, { projection: { _id: 0 } }).sort({ createdAt: -1 }).toArray();
}
