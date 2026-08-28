import { Router } from "express";

import optionalProtect from "../middleware/optionalProtect.middleware.js";
import protect from "../middleware/protect.middleware.js";
import validate from "../middleware/validate.middleware.js";

import {
    createPaymentController,
    verifyPaymentController,
    getPaymentController,
    webhookController,
} from "../controllers/payment.controller.js";

import {
    createPaymentSchema,
    verifyPaymentSchema,
    getPaymentSchema,
} from "../validators/payment.validator.js";

const router = Router();

// Guest + authenticated orders
router.post(
    "/",
    optionalProtect,
    validate(createPaymentSchema),
    createPaymentController
);

// Razorpay verification
router.post(
    "/verify",
    validate(verifyPaymentSchema),
    verifyPaymentController
);

// Authenticated users only
router.get(
    "/:paymentId",
    protect,
    validate(getPaymentSchema, "params"),
    getPaymentController
);

// Razorpay webhook
router.post(
    "/webhook",
    webhookController
);

export default router;