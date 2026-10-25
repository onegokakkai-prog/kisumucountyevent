import { z } from "zod";
import { collectAnswers, questionShapes, refineOthers, type Answers } from "@/lib/form-questions";
import { locationShapes, type DayId, type Location, type RegistrationForm } from "@/lib/registration-form";

export const kenyanPhone = /^(?:\+?254|0)(?:7|1)\d{8}$/;

export const phoneField = z
  .string()
  .transform((v) => v.replace(/[\s-]/g, ""))
  .pipe(z.string().regex(kenyanPhone, "Enter a Kenyan mobile number, e.g. 0712 345 678."));

export const emailField = z.union([z.literal(""), z.email("Enter a valid email address.")]);

export type Registration = Location & {
  role: string;
  name: string;
  phone: string;
  email: string;
  institution: string;
  groupSize: number;
  days: DayId[];
  interests: string[];
  wantsHub: boolean;
  hubService?: string;
  hubSlot?: string;
  emailUpdates: boolean;
  // Answers to the organisers' extra questions, by question id.
  answers: Answers;
};

const oneOf = (options: string[], message: string) =>
  z.string({ error: message }).refine((v) => options.includes(v), message);

// Validation follows whatever the organisers have set up: the choices offered, the parts of
// the form that are shown and the extra questions. Built per submission, since which
// questions apply depends on the answers (a ward for the chosen sub-county, follow-ups).
export function buildRegistrationSchema(form: RegistrationForm, raw: Record<string, unknown> & Location) {
  return z
    .object({
      role: oneOf(form.roles, "Choose how you're attending."),
      name: z.string().trim().min(2, "Enter your full name.").max(120),
      phone: phoneField,
      email: emailField,
      ...locationShapes(form.location, raw),
      institution: z.string().trim().max(160),
      groupSize: z.coerce
        .number({ error: "Enter a number." })
        .int()
        .min(1, "At least 1 person.")
        .max(100, "For groups over 100, please call us."),
      days: z.array(z.enum(["day-1", "day-2"])).min(1, "Choose at least one day."),
      interests: z.array(z.string().refine((v) => form.interests.includes(v))),
      wantsHub: z.boolean(),
      hubService: oneOf(form.hubServices, "Choose a service.").optional(),
      hubSlot: oneOf(form.hubSlots, "Choose a preferred time.").optional(),
      emailUpdates: z.boolean(),
      ...questionShapes(form.questions, raw),
    })
    .superRefine((v, ctx) => {
      if (v.wantsHub && !v.hubService) {
        ctx.addIssue({ code: "custom", path: ["hubService"], message: "Choose a service." });
      }
      if (v.wantsHub && !v.hubSlot) {
        ctx.addIssue({ code: "custom", path: ["hubSlot"], message: "Choose a preferred time." });
      }
      if (v.emailUpdates && !v.email) {
        ctx.addIssue({ code: "custom", path: ["email"], message: "Add your email so we can send you updates." });
      }
      refineOthers(form.questions, v, ctx);
    })
    .transform(
      (v): Registration => ({
        role: v.role,
        name: v.name,
        phone: v.phone,
        email: v.email,
        gender: v.gender,
        subCounty: v.subCounty,
        ward: v.ward,
        region: v.region,
        institution: v.institution,
        groupSize: v.groupSize,
        days: v.days,
        interests: v.interests,
        wantsHub: v.wantsHub,
        hubService: v.hubService,
        hubSlot: v.hubSlot,
        emailUpdates: v.emailUpdates,
        answers: collectAnswers(form.questions, v),
      }),
    );
}

export type FieldErrors = Record<string, string[] | undefined>;

export type RegisterState =
  | { status: "idle" }
  | {
      status: "error";
      message: string;
      errors: FieldErrors;
      values: Record<string, unknown>;
      submittedAt: number;
    }
  | { status: "success"; name: string; phone: string };
