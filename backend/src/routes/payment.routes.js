import { Router } from "express";

import protect from "../middleware/protect.middleware.js";
import validate from "../middleware/validate.middleware.js";

import {
    createPaymentController,
    verifyPaymentController,
    getPaymentController,
    webhookController
} from "../controllers/payment.controller.js";

import {
    createPaymentSchema,
    verifyPaymentSchema,
    getPaymentSchema,
} from "../validators/payment.validator.js";

const router = Router();

router.post(
    "/",
    protect,
    validate(createPaymentSchema),
    createPaymentController
);

router.post(
    "/verify",
    protect,
    validate(verifyPaymentSchema),
    verifyPaymentController
);

router.get(
    "/:paymentId",
    protect,
    validate(getPaymentSchema, "params"),
    getPaymentController
);

router.post("/webhook", webhookController);
export default router;