import { z } from "zod";

const shippingSchema = z.object({
    shippingFullName: z
        .string()
        .trim()
        .min(2, "Full name is required."),

    shippingPhone: z
        .string()
        .regex(
            /^[6-9]\d{9}$/,
            "Invalid phone number."
        ),

    shippingAddressLine1: z
        .string()
        .trim()
        .min(5, "Address is required."),

    shippingAddressLine2: z
        .string()
        .trim()
        .optional(),

    shippingCity: z
        .string()
        .trim()
        .min(2, "City is required."),

    shippingState: z
        .string()
        .trim()
        .min(2, "State is required."),

    shippingPostalCode: z
        .string()
        .regex(
            /^\d{6}$/,
            "Invalid postal code."
        ),

    shippingCountry: z
        .string()
        .trim()
        .min(2, "Country is required."),
});

export const createOrderSchema = z
    .object({
        addressId: z
            .string()
            .cuid("Invalid address ID.")
            .optional(),

        shipping: shippingSchema.optional(),

        guestEmail: z
            .string()
            .trim()
            .email("Invalid guest email.")
            .optional(),

        couponCode: z
            .string()
            .trim()
            .toUpperCase()
            .optional(),
    })
    .refine(
        (data) =>
            Boolean(data.addressId) !== Boolean(data.shipping),
        {
            message:
                "Provide either a saved address or shipping details.",
            path: ["shipping"],
        }
    );

export const getOrderByIdSchema = z.object({
    orderId: z.string().cuid("Invalid order ID."),
});

export const cancelOrderSchema = z.object({
    orderId: z.string().cuid("Invalid order ID."),
});