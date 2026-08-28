import { Router } from "express";

import protect from "../middleware/protect.middleware.js";
import admin from "../middleware/admin.middleware.js";
import validate from "../middleware/validate.middleware.js";

import {
    getAllOrdersController,
    getAdminOrderByIdController,
    updateOrderStatusController,
} from "../controllers/adminOrder.controller.js";

import {
    getAllOrdersSchema,
    adminOrderIdSchema,
    updateOrderStatusSchema,
} from "../validators/adminOrder.validator.js";

const router = Router();

router.get(
    "/",
    protect,
    admin,
    validate(getAllOrdersSchema, "query"),
    getAllOrdersController
);

router.get(
    "/:orderId",
    protect,
    admin,
    validate(adminOrderIdSchema, "params"),
    getAdminOrderByIdController
);

router.patch(
    "/:orderId/status",
    protect,
    admin,
    validate(adminOrderIdSchema, "params"),
    validate(updateOrderStatusSchema, "body"),
    updateOrderStatusController
);

export default router;