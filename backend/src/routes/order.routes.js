import { Router } from "express";

import {
    createOrderController,
    getOrderController,
    getOrderByIdController,
    cancelOrderController,
} from "../controllers/order.controller.js";

import {
    createOrderSchema,
    cancelOrderSchema,
    getOrderByIdSchema,
} from "../validators/order.validator.js";

import validate from "../middleware/validate.middleware.js";
import protect from "../middleware/protect.middleware.js";
import optionalProtect from "../middleware/optionalProtect.middleware.js";

const router = Router();

// Guest + authenticated checkout
router.post(
    "/",
    optionalProtect,
    validate(createOrderSchema),
    createOrderController
);

// Authenticated only
router.get(
    "/",
    protect,
    getOrderController
);

router.get(
    "/:orderId",
    protect,
    validate(getOrderByIdSchema, "params"),
    getOrderByIdController
);

router.delete(
    "/:orderId",
    protect,
    validate(cancelOrderSchema, "params"),
    cancelOrderController
);

export default router;