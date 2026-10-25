import { z } from "zod";

const kenyanPhone = /^(?:\+?254|0)(?:7|1)\d{8}$/;

export const pledgeSchema = z.object({
  name: z.string().trim().min(2, "Enter your name.").max(120),
  phone: z
    .string()
    .transform((v) => v.replace(/[\s-]/g, ""))
    .pipe(z.string().regex(kenyanPhone, "Enter a Kenyan mobile number, e.g. 0712 345 678.")),
  email: z.union([z.literal(""), z.email("Enter a valid email address.")]),
  amount: z.coerce
    .number({ error: "Enter an amount." })
    .int("Enter a whole number of shillings.")
    .min(50, "The smallest pledge is KES 50.")
    .max(10_000_000, "For large gifts, please call the festival team."),
  message: z.string().trim().max(500).optional().default(""),
});

export type PledgeFieldErrors = Partial<Record<keyof z.infer<typeof pledgeSchema>, string[]>>;

export type PledgeState =
  | { status: "idle" }
  | { status: "error"; message: string; errors: PledgeFieldErrors; values: Record<string, string>; submittedAt: number }
  | { status: "success"; name: string; amount: number };
