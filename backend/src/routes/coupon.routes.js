import { Router } from "express";
import validate from "../middleware/validate.middleware.js";
import {
    validateCouponController,
} from "../controllers/coupon.controller.js";
import {
    validateCouponSchema,
} from "../validators/coupon.validator.js";
import protect from "../middleware/protect.middleware.js";

const router = Router();

router.post(
    "/validate",
    protect,
    validate(validateCouponSchema),
    validateCouponController
);

export default router;