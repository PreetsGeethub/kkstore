import { z } from "zod";

export const createCouponSchema = z.object({
    code: z
        .string()
        .trim()
        .min(1, "Coupon code is required.")
        .toUpperCase(),

    discountType: z.enum([
        "PERCENTAGE",
        "FIXED",
    ]),

    discountValue: z
        .number()
        .positive("Discount value must be greater than 0."),

    minimumOrderAmount: z
        .number()
        .positive("Minimum order amount must be greater than 0.")
        .optional(),

    usageLimit: z
        .number()
        .int()
        .positive("Usage limit must be greater than 0.")
        .optional(),

    startsAt: z.coerce.date(),

    expiresAt: z.coerce.date(),

    isActive: z
        .boolean()
        .optional()
        .default(true),
});

export const updateCouponSchema = z.object({
    code: z
        .string()
        .trim()
        .min(1, "Coupon code is required.")
        .toUpperCase()
        .optional(),

    discountType: z
        .enum([
            "PERCENTAGE",
            "FIXED",
        ])
        .optional(),

    discountValue: z
        .number()
        .positive()
        .optional(),

    minimumOrderAmount: z
        .number()
        .positive()
        .optional(),

    usageLimit: z
        .number()
        .int()
        .positive()
        .optional(),

    startsAt: z.coerce.date().optional(),

    expiresAt: z.coerce.date().optional(),

    isActive: z
        .boolean()
        .optional(),
});

export const couponIdSchema = z.object({
    id: z.string().cuid("Invalid coupon ID."),
});

export const getCouponsSchema = z.object({
    page: z.coerce
        .number()
        .int()
        .positive()
        .default(1),

    limit: z.coerce
        .number()
        .int()
        .positive()
        .max(100)
        .default(10),

    search: z.string()
        .trim()
        .default(""),

    status: z.enum([
        "active",
        "inactive",
        "all",
    ]).default("all"),
});