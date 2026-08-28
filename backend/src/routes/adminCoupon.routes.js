import { Router } from "express";

import protect from "../middleware/protect.middleware.js";
import admin from "../middleware/admin.middleware.js";
import validate from "../middleware/validate.middleware.js";

import {
    create,
    getAll,
    getById,
    update,
    deleteCouponController,
} from "../controllers/adminCoupon.controller.js";

import {
    createCouponSchema,
    updateCouponSchema,
    couponIdSchema,
    getCouponsSchema,
} from "../validators/adminCoupon.validator.js";

const router = Router();

router.post(
    "/",
    protect,
    admin,
    validate(createCouponSchema),
    create
);

router.get(
    "/",
    protect,
    admin,
    validate(getCouponsSchema, "query"),
    getAll
);

router.get(
    "/:id",
    protect,
    admin,
    validate(couponIdSchema, "params"),
    getById
);

router.patch(
    "/:id",
    protect,
    admin,
    validate(couponIdSchema, "params"),
    validate(updateCouponSchema, "body"),
    update
);

router.delete(
    "/:id",
    protect,
    admin,
    validate(couponIdSchema, "params"),
    deleteCouponController
);

export default router;