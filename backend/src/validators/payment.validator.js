import { z } from "zod";

export const createPaymentSchema = z.object({
    orderId: z.string().cuid({
        message: "Invalid order ID.",
    }),
});

export const verifyPaymentSchema = z.object({
    razorpay_order_id: z
        .string()
        .min(1, "Razorpay order ID is required."),

    razorpay_payment_id: z
        .string()
        .min(1, "Razorpay payment ID is required."),

    razorpay_signature: z
        .string()
        .min(1, "Razorpay signature is required."),
});

export const getPaymentSchema = z.object({
    paymentId: z.string().cuid({
        message: "Invalid payment ID.",
    }),
});