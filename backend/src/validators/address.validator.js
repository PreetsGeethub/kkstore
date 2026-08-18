
import {z} from 'zod';
export const createAddressSchema = z.object({
    fullName: z
        .string()
        .trim()
        .min(2, "Full name is required."),

    phone: z
        .string()
        .trim()
        .regex(
            /^[6-9]\d{9}$/,
            "Invalid Indian phone number."
        ),

    addressLine1: z
        .string()
        .trim()
        .min(5, "Address Line 1 is required."),

    addressLine2: z
        .string()
        .trim()
        .optional(),

    city: z
        .string()
        .trim()
        .min(2, "City is required."),

    state: z
        .string()
        .trim()
        .min(2, "State is required."),

    postalCode: z
        .string()
        .trim()
        .regex(
            /^\d{6}$/,
            "Invalid postal code."
        ),

    country: z
        .string()
        .trim()
        .min(2, "Country is required."),

    isDefault: z
        .boolean()
        .optional()
        .default(false),
});

export const updateAddressSchema = z.object({
    fullName: z.string().trim().min(2).optional(),

    phone: z
        .string()
        .trim()
        .regex(/^[6-9]\d{9}$/, "Invalid Indian phone number.")
        .optional(),

    addressLine1: z.string().trim().min(5).optional(),

    addressLine2: z.string().trim().optional(),

    city: z.string().trim().min(2).optional(),

    state: z.string().trim().min(2).optional(),

    postalCode: z
        .string()
        .trim()
        .regex(/^\d{6}$/, "Invalid postal code.")
        .optional(),

    country: z.string().trim().min(2).optional(),

    isDefault: z.boolean().optional(),
});

export const addressIdSchema = z.object({
    addressId: z.string().cuid("Invalid address ID."),
});