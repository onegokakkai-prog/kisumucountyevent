import { z } from "zod";
import { hubServices, hubSlots, interests, roles, subCounties } from "@/lib/festival";

const kenyanPhone = /^(?:\+?254|0)(?:7|1)\d{8}$/;

export const registrationSchema = z
  .object({
    role: z.enum(roles, { error: "Choose how you're attending." }),
    name: z.string().trim().min(2, "Enter your full name.").max(120),
    phone: z
      .string()
      .transform((v) => v.replace(/[\s-]/g, ""))
      .pipe(z.string().regex(kenyanPhone, "Enter a Kenyan mobile number, e.g. 0712 345 678.")),
    email: z.union([z.literal(""), z.email("Enter a valid email address.")]),
    subCounty: z.enum(subCounties, { error: "Choose your sub-county." }),
    institution: z.string().trim().max(160).optional().default(""),
    groupSize: z.coerce
      .number({ error: "Enter a number." })
      .int()
      .min(1, "At least 1 person.")
      .max(100, "For groups over 100, please call us."),
    days: z.array(z.enum(["day-1", "day-2"])).min(1, "Choose at least one day."),
    interests: z.array(z.enum(interests)).default([]),
    wantsHub: z.boolean(),
    hubService: z.enum(hubServices).optional(),
    hubSlot: z.enum(hubSlots).optional(),
    emailUpdates: z.boolean(),
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
  });

export type Registration = z.infer<typeof registrationSchema>;

export type FieldErrors = Partial<Record<keyof Registration, string[]>>;

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
