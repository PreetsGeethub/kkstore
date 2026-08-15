import { Router } from "express";

import protect from "../middleware/protect.middleware.js";
import validate from "../middleware/validate.middleware.js";

import {
    createReviewController,
    getProductReviewsController,
    updateReviewController,
    deleteReviewController,
} from "../controllers/review.controller.js";

import {
    createReviewSchema,
    getProductReviewsSchema,
    updateReviewParamsSchema,
    updateReviewSchema,
    deleteReviewSchema,
} from "../validators/review.validator.js";

const router = Router();

router.post(
    "/",
    protect,
    validate(createReviewSchema),
    createReviewController
);

router.get(
    "/product/:productId",
    validate(getProductReviewsSchema, "params"),
    getProductReviewsController
);

router.patch(
    "/:reviewId",
    protect,
    validate(updateReviewParamsSchema, "params"),
    validate(updateReviewSchema),
    updateReviewController
);

router.delete(
    "/:reviewId",
    protect,
    validate(deleteReviewSchema, "params"),
    deleteReviewController
);

export default router;