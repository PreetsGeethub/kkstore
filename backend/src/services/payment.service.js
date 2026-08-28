import razorpay from "../config/razorpay.js";
import ApiError from "../utils/ApiError.js";
import crypto from "crypto";
import { env } from "../config/env.js";
import prisma from "../config/prisma.js";
import {
    PaymentMethod,
    OrderStatus,
    PaymentStatus,
} from "../../generated/prisma/index.js";


export const createPayment = async (orderId) => {
    return await prisma.$transaction(async (tx) => {

        const order = await tx.order.findFirst({
            where: {
                id: orderId,
                status: OrderStatus.PENDING_PAYMENT,
            },
            select: {
                id: true,
                orderNumber: true,
                totalAmount: true,
            },
        });

        if (!order) {
            throw new ApiError(
                404,
                "Pending order not found."
            );
        }

        const existingPayment = await tx.payment.findUnique({
            where: {
                orderId,
            },
        });

        if (existingPayment) {
            throw new ApiError(
                409,
                "Payment already exists."
            );
        }

        let razorpayOrder;

        try {
            razorpayOrder = await razorpay.orders.create({
                amount: order.totalAmount
                    .mul(100)
                    .toNumber(),

                currency: "INR",

                receipt: order.orderNumber,
            });
        } catch (error) {
            throw new ApiError(
                502,
                "Failed to create Razorpay order."
            );
        }

        const payment = await tx.payment.create({
            data: {
                orderId: order.id,

                paymentMethod: null,

                paymentStatus: PaymentStatus.PENDING,

                amount: order.totalAmount,

                gatewayOrderId: razorpayOrder.id,

                gateway: "RAZORPAY",
            },
        });

        return {
            paymentId: payment.id,

            orderId: order.id,

            razorpayOrderId: razorpayOrder.id,

            amount: razorpayOrder.amount,

            displayAmount: order.totalAmount,

            currency: razorpayOrder.currency,

            key: env.RAZORPAY_KEY_ID,
        };
    });
};


export const verifyPayment = async (paymentData) => {

    const {
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
    } = paymentData;

    return await prisma.$transaction(async (tx) => {

        const payment = await tx.payment.findUnique({
            where: {
                gatewayOrderId: razorpay_order_id,
            },
            select: {
                id: true,
                orderId: true,
                gatewayOrderId: true,
                paymentStatus: true,
            },
        });

        if (!payment) {
            throw new ApiError(
                404,
                "Payment not found."
            );
        }

        if (
            payment.paymentStatus === PaymentStatus.SUCCESS
        ) {
            throw new ApiError(
                409,
                "Payment already verified."
            );
        }

        const generatedSignature = crypto
            .createHmac(
                "sha256",
                env.RAZORPAY_KEY_SECRET
            )
            .update(
                `${payment.gatewayOrderId}|${razorpay_payment_id}`
            )
            .digest("hex");

        if (
            generatedSignature !== razorpay_signature
        ) {
            throw new ApiError(
                400,
                "Invalid payment signature."
            );
        }

        const razorpayPayment =
            await razorpay.payments.fetch(
                razorpay_payment_id
            );

        if (
            razorpayPayment.status !== "captured"
        ) {
            throw new ApiError(
                400,
                "Payment not captured."
            );
        }

        const paymentMethodMap = {
            upi: PaymentMethod.UPI,
            card: PaymentMethod.CARD,
            wallet: PaymentMethod.WALLET,
            netbanking: PaymentMethod.NET_BANKING,
        };

        const paymentMethod =
            paymentMethodMap[
                razorpayPayment.method
            ];

        if (!paymentMethod) {
            throw new ApiError(
                400,
                "Unsupported payment method."
            );
        }

        await tx.payment.update({
            where: {
                id: payment.id,
            },
            data: {
                paymentStatus:
                    PaymentStatus.SUCCESS,

                paymentMethod,

                transactionId:
                    razorpay_payment_id,

                paidAt: new Date(
                    razorpayPayment.created_at * 1000
                ),
            },
        });

        const updatedOrder =
            await tx.order.update({
                where: {
                    id: payment.orderId,
                },
                data: {
                    status:
                        OrderStatus.CONFIRMED,
                },
            });

        return updatedOrder;
    });
};


export const getPayment = async (
    paymentId,
    userId
) => {

    const payment =
        await prisma.payment.findFirst({
            where: {
                id: paymentId,

                order: {
                    userId,
                },
            },

            select: {
                id: true,

                paymentMethod: true,

                paymentStatus: true,

                amount: true,

                transactionId: true,

                gateway: true,

                gatewayOrderId: true,

                paidAt: true,

                createdAt: true,
            },
        });

    if (!payment) {
        throw new ApiError(
            404,
            "Payment not found."
        );
    }

    return payment;
};


export const handleWebhook = async (req) => {

    const signature =
        req.headers["x-razorpay-signature"];

    if (!signature) {
        throw new ApiError(
            400,
            "Missing webhook signature."
        );
    }

    const rawBody = req.body;

    const generatedSignature =
        crypto
            .createHmac(
                "sha256",
                env.RAZORPAY_WEBHOOK_SECRET
            )
            .update(rawBody)
            .digest("hex");

    if (
        generatedSignature !== signature
    ) {
        throw new ApiError(
            400,
            "Invalid webhook signature."
        );
    }

    const event =
        JSON.parse(
            rawBody.toString()
        );

    if (
        event.event !==
        "payment.captured"
    ) {
        return;
    }

    const payment =
        event.payload?.payment?.entity;

    if (
        !payment?.id ||
        !payment?.order_id
    ) {
        throw new ApiError(
            400,
            "Invalid webhook payload."
        );
    }

    return await prisma.$transaction(
        async (tx) => {

            const existingPayment =
                await tx.payment.findUnique({
                    where: {
                        gatewayOrderId:
                            payment.order_id,
                    },

                    select: {
                        id: true,
                        orderId: true,
                        paymentStatus: true,
                    },
                });

            if (!existingPayment) {
                return;
            }

            if (
                existingPayment.paymentStatus ===
                PaymentStatus.SUCCESS
            ) {
                return;
            }

            const paymentMethodMap = {
                upi: PaymentMethod.UPI,
                card: PaymentMethod.CARD,
                wallet: PaymentMethod.WALLET,
                netbanking:
                    PaymentMethod.NET_BANKING,
            };

            const paymentMethod =
                paymentMethodMap[
                    payment.method
                ];

            if (!paymentMethod) {
                throw new ApiError(
                    400,
                    "Unsupported payment method."
                );
            }

            await tx.payment.update({
                where: {
                    id: existingPayment.id,
                },

                data: {
                    paymentStatus:
                        PaymentStatus.SUCCESS,

                    paymentMethod,

                    transactionId:
                        payment.id,

                    paidAt: new Date(
                        payment.created_at * 1000
                    ),
                },
            });

            await tx.order.update({
                where: {
                    id: existingPayment.orderId,
                },

                data: {
                    status:
                        OrderStatus.CONFIRMED,
                },
            });
        }
    );
};