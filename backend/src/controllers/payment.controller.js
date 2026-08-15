import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";

import {
    createPayment,
    verifyPayment,
    getPayment,
} from "../services/payment.service.js";

export const createPaymentController = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { orderId } = req.validated.body;

    const payment = await createPayment(orderId, userId);

    return res.status(201).json(
        new ApiResponse(
            201,
            "Payment order created successfully.",
            payment
        )
    );
});

export const verifyPaymentController = asyncHandler(async (req, res) => {
    const paymentData = req.validated.body;

    const payment = await verifyPayment(paymentData);

    return res.status(200).json(
        new ApiResponse(
            200,
            "Payment verified successfully.",
            payment
        )
    );
});

export const getPaymentController = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { paymentId } = req.validated.params;

    const payment = await getPayment(paymentId, userId);

    return res.status(200).json(
        new ApiResponse(
            200,
            "Payment fetched successfully.",
            payment
        )
    );
});


export const webhookController = asyncHandler(async (req, res) => {
    await handleWebhook(req);

    return res.status(200).json(
        new ApiResponse(
            200,
            "Webhook processed successfully."
        )
    );
});