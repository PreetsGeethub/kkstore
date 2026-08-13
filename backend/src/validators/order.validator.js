import { z } from "zod";
export const createOrderSchema = z.object({
    shippingFullName: z.string().trim().min(2),

    shippingPhone: z
        .string()
        .regex(/^[6-9]\d{9}$/),

    shippingAddressLine1: z
        .string()
        .trim()
        .min(5),

    shippingAddressLine2: z
        .string()
        .trim()
        .optional(),

    shippingCity: z
        .string()
        .trim()
        .min(2),

    shippingState: z
        .string()
        .trim()
        .min(2),

    shippingPostalCode: z
        .string()
        .regex(/^\d{6}$/),

    shippingCountry: z
        .string()
        .trim()
        .min(2),
});

export const getOrderByIdSchema = z.object({
    orderId: z.string().cuid("Invalid order ID."),
});

export const cancelOrderSchema = z.object({
    orderId: z.string().cuid("Invalid order ID."),
});