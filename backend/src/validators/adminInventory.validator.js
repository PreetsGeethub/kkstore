import { z } from "zod";

export const getInventorySchema = z.object({
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

    search: z
        .string()
        .trim()
        .default(""),

    stockStatus: z.enum([
        "all",
        "inStock",
        "lowStock",
        "outOfStock",
    ]).default("all"),

    status: z.enum([
        "active",
        "inactive",
        "all",
    ]).default("active"),
});

export const inventoryVariantIdSchema = z.object({
    variantId: z.string().cuid("Invalid variant ID."),
});

export const updateInventorySchema = z.object({
    stock: z
        .number()
        .int()
        .min(0, "Stock cannot be negative."),
});