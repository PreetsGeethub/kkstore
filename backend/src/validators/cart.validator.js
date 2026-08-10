import { z } from "zod";

// POST /cart
export const createCartSchema = z.object({
    variantId: z.string().cuid("Invalid variant ID."),
    quantity: z
        .number()
        .int()
        .positive("Quantity must be a positive integer."),
});

// PATCH /cart/:variantId (body)
export const updateCartSchema = z.object({
    quantity: z
        .number()
        .int()
        .nonnegative("Quantity must be a non-negative integer."),
});

// PATCH /cart/:variantId (params)
export const updateCartParamsSchema = z.object({
    variantId: z.string().cuid("Invalid variant ID."),
});

// DELETE /cart/:variantId
export const deleteCartItemSchema = z.object({
    variantId: z.string().cuid("Invalid variant ID."),
});