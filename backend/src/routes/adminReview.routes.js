import { Router } from "express";

import protect from "../middleware/protect.middleware.js";
import admin from "../middleware/admin.middleware.js";
import validate from "../middleware/validate.middleware.js";

import {
    getAllReviewsController,
    getAdminReviewByIdController,
    deleteAdminReviewController,
} from "../controllers/adminReview.controller.js";

import {
    getAllReviewsSchema,
    adminReviewIdSchema,
    deleteAdminReviewSchema,
} from "../validators/adminReview.validator.js";

const router = Router();


// Get all reviews
router.get(
    "/",
    protect,
    admin,
    validate(getAllReviewsSchema, "query"),
    getAllReviewsController
);


// Get review by ID
router.get(
    "/:reviewId",
    protect,
    admin,
    validate(adminReviewIdSchema, "params"),
    getAdminReviewByIdController
);


// Delete review
router.delete(
    "/:reviewId",
    protect,
    admin,
    validate(deleteAdminReviewSchema, "params"),
    deleteAdminReviewController
);


export default router;