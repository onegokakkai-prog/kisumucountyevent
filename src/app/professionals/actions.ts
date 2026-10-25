"use server";

import { z } from "zod";
import { getContent } from "@/lib/content";
import { readQuestionValues } from "@/lib/form-questions";
import { saveProfessional } from "@/lib/professionals";
import { readLocation, toProfessionalForm } from "@/lib/registration-form";
import type { RegisterState } from "../register/schema";
import { buildProfessionalSchema } from "./schema";

export async function registerProfessional(_prev: RegisterState, formData: FormData): Promise<RegisterState> {
  const form = toProfessionalForm(await getContent());
  const text = (key: string) => {
    const v = formData.get(key);
    return typeof v === "string" ? v : "";
  };
  const raw = {
    name: text("name"),
    phone: text("phone"),
    email: text("email"),
    ...readLocation(formData, form.location),
    ...readQuestionValues(formData, form.questions),
  };
  const parsed = buildProfessionalSchema(form, raw).safeParse(raw);

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
    const result = await saveProfessional(parsed.data);
    if (!result.ok) {
      return {
        status: "error",
        message: "This phone number has already been used on this form. To change your details, call the festival team.",
        errors: { phone: ["This number has already been used."] },
        values: raw,
        submittedAt: Date.now(),
      };
    }
  } catch (err) {
    console.error("Failed to save professional", err);
    return {
      status: "error",
      message: "We couldn't save your details just now. Please try again, or call the festival team.",
      errors: {},
      values: raw,
      submittedAt: Date.now(),
    };
  }

  return { status: "success", name: parsed.data.name, phone: parsed.data.phone };
}
