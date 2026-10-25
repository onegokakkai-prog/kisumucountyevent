import { z } from "zod";
import { collectAnswers, questionShapes, refineOthers, type Answers } from "@/lib/form-questions";
import { locationShapes, type Location, type ProfessionalForm } from "@/lib/registration-form";
import { emailField, phoneField } from "../register/schema";

export type Professional = Location & {
  name: string;
  phone: string;
  email: string;
  answers: Answers;
};

export function buildProfessionalSchema(form: ProfessionalForm, raw: Record<string, unknown> & Location) {
  return z
    .object({
      name: z.string().trim().min(2, "Enter your full name.").max(120),
      phone: phoneField,
      email: emailField,
      ...locationShapes(form.location, raw),
      ...questionShapes(form.questions, raw),
    })
    .superRefine((v, ctx) => refineOthers(form.questions, v, ctx))
    .transform(
      (v): Professional => ({
        name: v.name,
        phone: v.phone,
        email: v.email,
        gender: v.gender,
        subCounty: v.subCounty,
        ward: v.ward,
        region: v.region,
        answers: collectAnswers(form.questions, v),
      }),
    );
}
