import { z } from "zod";

export const validateCouponSchema = z.object({
    code: z
        .string()
        .trim()
        .min(1, "Coupon code is required.")
        .toUpperCase(),

    subtotal: z
        .string()
        .regex(/^\d+(\.\d{1,2})?$/, "Invalid subtotal."),
});