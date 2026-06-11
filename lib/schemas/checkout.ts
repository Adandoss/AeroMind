import { z } from "zod";
import { Plan } from "@/generated/prisma/client";

export const CheckoutSchema = z.object({
  plan: z.nativeEnum(Plan, { message: "Invalid subscription plan selection" }),
  cardNumber: z.string().regex(/^\d{16}$/, "Card number must be exactly 16 digits"),
  cvc: z.string().regex(/^\d{3,4}$/, "CVC must be 3 or 4 digits"),
  expiry: z.string().regex(/^(0[1-9]|1[0-2])\/\d{2}$/, "Expiry date must be in MM/YY format"),
});

export type CheckoutInput = z.infer<typeof CheckoutSchema>;
