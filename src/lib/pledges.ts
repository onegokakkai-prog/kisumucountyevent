import "server-only";
import { ObjectId } from "mongodb";
import { cacheLife, cacheTag } from "next/cache";
import { getDb } from "./mongodb";
import { normalisePhone } from "./registrations";

export type PledgeStatus = "pledged" | "received";

export type PledgeInput = {
  name: string;
  phone: string;
  email: string;
  amount: number;
  bricks: number | null;
  message: string;
};

type PledgeDoc = PledgeInput & { _id?: ObjectId; status: PledgeStatus; createdAt: Date };

export type StoredPledge = PledgeInput & { id: string; status: PledgeStatus; createdAt: Date };

function pledges() {
  return getDb().collection<PledgeDoc>("pledges");
}

export async function savePledge(input: PledgeInput) {
  await pledges().insertOne({ ...input, phone: normalisePhone(input.phone), status: "pledged", createdAt: new Date() });
}

export async function listPledges(): Promise<StoredPledge[]> {
  const rows = await pledges().find({}).sort({ createdAt: -1 }).toArray();
  return rows.map(({ _id, ...rest }) => ({ ...rest, id: _id!.toHexString() }));
}

export async function setPledgeStatus(id: string, status: PledgeStatus) {
  if (!ObjectId.isValid(id)) return;
  await pledges().updateOne({ _id: new ObjectId(id) }, { $set: { status } });
}

export async function deletePledge(id: string) {
  if (!ObjectId.isValid(id)) return;
  await pledges().deleteOne({ _id: new ObjectId(id) });
}

// Money confirmed as received, shown on the public Buy-a-Brick progress bar.
export async function getReceivedTotal(): Promise<number> {
  "use cache";
  cacheTag("pledges");
  try {
    const [row] = await pledges()
      .aggregate<{ total: number }>([{ $match: { status: "received" } }, { $group: { _id: null, total: { $sum: "$amount" } } }])
      .toArray();
    cacheLife("max");
    return row?.total ?? 0;
  } catch (err) {
    console.error("Failed to total pledges", err);
    cacheLife("minutes");
    return 0;
  }
}
