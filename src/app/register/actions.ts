"use server";

import { updateTag } from "next/cache";
import { z } from "zod";
import { getContent } from "@/lib/content";
import { readQuestionValues } from "@/lib/form-questions";
import { saveRegistration } from "@/lib/registrations";
import { readLocation, toRegistrationForm, type RegistrationForm } from "@/lib/registration-form";
import { buildRegistrationSchema, type RegisterState } from "./schema";

// Parts of the form the organisers have hidden are filled with neutral values, so a stale
// page or a crafted request can't slip in answers the form no longer asks for.
function readForm(formData: FormData, form: RegistrationForm) {
  const text = (key: string) => {
    const v = formData.get(key);
    return typeof v === "string" ? v : "";
  };
  const role = text("role");
  const wantsHub = form.show.hub && formData.get("wantsHub") === "on";
  const askInstitution = form.show.institution && form.rolesWithInstitution.includes(role);
  return {
    role,
    name: text("name"),
    phone: text("phone"),
    email: form.show.email ? text("email") : "",
    ...readLocation(formData, form.location),
    institution: askInstitution ? text("institution") : "",
    groupSize: form.show.groupSize ? text("groupSize") : "1",
    days: formData.getAll("days"),
    interests: form.show.interests ? formData.getAll("interests") : [],
    wantsHub,
    hubService: wantsHub ? text("hubService") || undefined : undefined,
    hubSlot: wantsHub ? text("hubSlot") || undefined : undefined,
    emailUpdates: form.show.updates && formData.get("emailUpdates") === "on",
    ...readQuestionValues(formData, form.questions),
  };
}

export async function register(_prev: RegisterState, formData: FormData): Promise<RegisterState> {
  const form = toRegistrationForm(await getContent());
  const raw = readForm(formData, form);
  const parsed = buildRegistrationSchema(form, raw).safeParse(raw);

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

  updateTag("registrations");
  return { status: "success", name: parsed.data.name, phone: parsed.data.phone };
}
