import { z } from "zod";

export const addGuestCartItemSchema = z.object({
    variantId: z.string().cuid("Invalid variant ID."),

    quantity: z
        .number()
        .int()
        .min(1, "Quantity must be at least 1."),
});

export const updateGuestCartItemSchema = z.object({
    quantity: z
        .number()
        .int()
        .min(1, "Quantity must be at least 1."),
});

export const guestCartItemParamsSchema = z.object({
    itemId: z.string().cuid("Invalid cart item ID."),
});