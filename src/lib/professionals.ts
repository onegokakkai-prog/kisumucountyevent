import "server-only";
import { MongoServerError, type Collection } from "mongodb";
import type { Professional } from "@/app/professionals/schema";
import { getDb } from "./mongodb";
import { normalisePhone } from "./registrations";

export type StoredProfessional = Professional & { createdAt: Date };

let indexesReady: Promise<unknown> | undefined;

async function professionals(): Promise<Collection<StoredProfessional>> {
  const collection = getDb().collection<StoredProfessional>("professionals");
  indexesReady ??= collection
    .createIndexes([{ key: { phone: 1 }, unique: true }, { key: { createdAt: -1 } }])
    .catch((err) => {
      indexesReady = undefined;
      throw err;
    });
  await indexesReady;
  return collection;
}

export async function saveProfessional(professional: Professional): Promise<{ ok: true } | { ok: false; reason: "duplicate" }> {
  const collection = await professionals();
  try {
    await collection.insertOne({ ...professional, phone: normalisePhone(professional.phone), createdAt: new Date() });
    return { ok: true };
  } catch (err) {
    if (err instanceof MongoServerError && err.code === 11000) return { ok: false, reason: "duplicate" };
    throw err;
  }
}

export async function listProfessionals(): Promise<StoredProfessional[]> {
  const collection = await professionals();
  return collection.find({}, { projection: { _id: 0 } }).sort({ createdAt: -1 }).toArray();
}
