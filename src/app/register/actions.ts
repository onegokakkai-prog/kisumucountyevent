"use server";

import { z } from "zod";
import { saveRegistration } from "@/lib/registrations";
import { registrationSchema, type RegisterState } from "./schema";

function readForm(formData: FormData) {
  const wantsHub = formData.get("wantsHub") === "on";
  return {
    role: formData.get("role") ?? "",
    name: formData.get("name") ?? "",
    phone: formData.get("phone") ?? "",
    email: formData.get("email") ?? "",
    subCounty: formData.get("subCounty") ?? "",
    institution: formData.get("institution") ?? "",
    groupSize: formData.get("groupSize") ?? "",
    days: formData.getAll("days"),
    interests: formData.getAll("interests"),
    wantsHub,
    hubService: wantsHub ? formData.get("hubService") || undefined : undefined,
    hubSlot: wantsHub ? formData.get("hubSlot") || undefined : undefined,
    emailUpdates: formData.get("emailUpdates") === "on",
  };
}

export async function register(_prev: RegisterState, formData: FormData): Promise<RegisterState> {
  const raw = readForm(formData);
  const parsed = registrationSchema.safeParse(raw);

  if (!parsed.success) {
    return {
      status: "error",
      message: "Please check the highlighted fields.",
      errors: z.flattenError(parsed.error).fieldErrors,
      values: raw,
      submittedAt: Date.now(),
    };
  }

  try {
    const result = await saveRegistration(parsed.data);
    if (!result.ok) {
      return {
        status: "error",
        message: "This phone number is already registered. To change your details, call the festival team.",
        errors: { phone: ["This number is already registered."] },
        values: raw,
        submittedAt: Date.now(),
      };
    }
  } catch (err) {
    console.error("Failed to save registration", err);
    return {
      status: "error",
      message: "We couldn't save your registration just now. Please try again, or call us to register.",
      errors: {},
      values: raw,
      submittedAt: Date.now(),
    };
  }

  return { status: "success", name: parsed.data.name, phone: parsed.data.phone };
}
