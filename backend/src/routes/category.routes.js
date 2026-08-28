import { Router } from "express";

import validate from "../middleware/validate.middleware.js";
import protect from "../middleware/protect.middleware.js";
import admin from "../middleware/admin.middleware.js";

import {
    createCategorySchema,
    updateCategorySchema,
    getCategoriesSchema,
    getCategoryByIdSchema,
    deleteCategorySchema,
} from "../validators/category.validator.js";

import {
    create,
    getAllCategory,
    getCategoryId,
    update,
    deleteCat,
} from "../controllers/category.controller.js";

const router = Router();

router.post(
    "/",
    protect,
    admin,
    validate(createCategorySchema),
    create
);

router.get(
    "/",
    protect,
    validate(getCategoriesSchema, "query"),
    getAllCategory
);

router.get(
    "/:id",
    protect,
    validate(getCategoryByIdSchema, "params"),
    getCategoryId
);

router.patch(
    "/:id",
    protect,
    admin,
    validate(getCategoryByIdSchema, "params"),
    validate(updateCategorySchema, "body"),
    update
);

router.delete(
    "/:id",
    protect,
    admin,
    validate(deleteCategorySchema, "params"),
    deleteCat
);

export default router;