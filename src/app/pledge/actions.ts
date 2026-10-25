"use server";

import { z } from "zod";
import { getContent } from "@/lib/content";
import { savePledge } from "@/lib/pledges";
import { pledgeSchema, type PledgeState } from "./schema";

export async function pledge(_prev: PledgeState, formData: FormData): Promise<PledgeState> {
  const raw = {
    name: String(formData.get("name") ?? ""),
    phone: String(formData.get("phone") ?? ""),
    email: String(formData.get("email") ?? ""),
    amount: String(formData.get("amount") ?? ""),
    message: String(formData.get("message") ?? ""),
  };
  const parsed = pledgeSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      status: "error",
      message: "Please check the highlighted fields.",
      errors: z.flattenError(parsed.error).fieldErrors,
      values: raw,
      submittedAt: Date.now(),
    };
  }

  const { pricePerBrick } = (await getContent()).brick;
  const bricks = pricePerBrick ? Math.floor(parsed.data.amount / pricePerBrick) || null : null;

  try {
    await savePledge({ ...parsed.data, bricks });
  } catch (err) {
    console.error("Failed to save pledge", err);
    return {
      status: "error",
      message: "We couldn't save your pledge just now. Please try again, or call the festival team.",
      errors: {},
      values: raw,
      submittedAt: Date.now(),
    };
  }
  return { status: "success", name: parsed.data.name, amount: parsed.data.amount };
}
