"use server";

import { updateTag } from "next/cache";
import { requireAdmin } from "@/lib/admin-auth";
import { deletePledge, setPledgeStatus, type PledgeStatus } from "@/lib/pledges";

export async function updatePledgeStatus(id: string, status: PledgeStatus) {
  await requireAdmin();
  await setPledgeStatus(id, status);
  updateTag("pledges");
}

export async function removePledge(id: string) {
  await requireAdmin();
  await deletePledge(id);
  updateTag("pledges");
}
