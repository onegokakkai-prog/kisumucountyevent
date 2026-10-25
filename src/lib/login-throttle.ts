import "server-only";
import { getDb } from "./mongodb";

// Locks sign-in for a connection after repeated wrong passwords. Counts live in MongoDB so
// the limit holds across server instances; a TTL index clears old records on its own.

const MAX_FAILURES = 5;
const WINDOW_MS = 15 * 60 * 1000;

type Attempts = { _id: string; failures: number; firstAt: Date; lockedUntil?: Date; expiresAt: Date };

let indexReady: Promise<unknown> | undefined;

async function attempts() {
  const collection = getDb().collection<Attempts>("login_attempts");
  indexReady ??= collection.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 }).catch((err) => {
    indexReady = undefined;
    throw err;
  });
  await indexReady;
  return collection;
}

// Minutes left on a lockout, or 0 when sign-in is allowed. If the database is down, sign-in
// stays possible rather than locking organisers out.
export async function lockedMinutes(key: string): Promise<number> {
  try {
    const doc = await (await attempts()).findOne({ _id: key });
    const left = doc?.lockedUntil ? doc.lockedUntil.getTime() - Date.now() : 0;
    return left > 0 ? Math.ceil(left / 60000) : 0;
  } catch (err) {
    console.error("Login throttle check failed", err);
    return 0;
  }
}

export async function recordFailure(key: string) {
  try {
    const collection = await attempts();
    const now = new Date();
    const doc = await collection.findOne({ _id: key });
    const fresh = !doc || now.getTime() - doc.firstAt.getTime() > WINDOW_MS;
    const failures = fresh ? 1 : doc.failures + 1;
    const lockedUntil = failures >= MAX_FAILURES ? new Date(now.getTime() + WINDOW_MS) : undefined;
    await collection.replaceOne(
      { _id: key },
      {
        failures,
        firstAt: fresh ? now : doc.firstAt,
        ...(lockedUntil ? { lockedUntil } : {}),
        expiresAt: new Date(now.getTime() + 2 * WINDOW_MS),
      },
      { upsert: true },
    );
  } catch (err) {
    console.error("Login throttle update failed", err);
  }
}

export async function clearFailures(key: string) {
  try {
    await (await attempts()).deleteOne({ _id: key });
  } catch (err) {
    console.error("Login throttle reset failed", err);
  }
}
