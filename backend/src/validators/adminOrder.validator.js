import { z } from "zod";

export const getAllOrdersSchema = z.object({
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

    status: z
        .enum([
            "PENDING_PAYMENT",
            "CONFIRMED",
            "PACKED",
            "SHIPPED",
            "OUT_FOR_DELIVERY",
            "DELIVERED",
            "PAYMENT_FAILED",
            "CANCELLED",
            "REPLACEMENT_REQUESTED",
            "REPLACEMENT_APPROVED",
            "REPLACEMENT_REJECTED",
            "all",
        ])
        .default("all"),

    sortBy: z
        .enum([
            "createdAt",
            "updatedAt",
            "totalAmount",
            "status",
        ])
        .default("createdAt"),

    order: z
        .enum([
            "asc",
            "desc",
        ])
        .default("desc"),
});

export const adminOrderIdSchema = z.object({
    orderId: z.string().cuid("Invalid order ID."),
});

export const updateOrderStatusSchema = z.object({
    status: z.enum([
        "PENDING_PAYMENT",
        "CONFIRMED",
        "PACKED",
        "SHIPPED",
        "OUT_FOR_DELIVERY",
        "DELIVERED",
        "PAYMENT_FAILED",
        "CANCELLED",
        "REPLACEMENT_REQUESTED",
        "REPLACEMENT_APPROVED",
        "REPLACEMENT_REJECTED",
    ]),
});