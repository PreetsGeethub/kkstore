import { Router } from "express";

import {
    create,
    update,
    getAll,
    getById,
    deleteProd,
} from "../controllers/product.controller.js";

import validate from "../middleware/validate.middleware.js";

import {
    createProductSchema,
    updateProductSchema,
    getProductByIdSchema,
    getProductsSchema,
    deleteProductSchema,
} from "../validators/product.validator.js";

import protect from "../middleware/protect.middleware.js";
import admin from "../middleware/admin.middleware.js";

const router = Router();

router.post(
    "/",
    protect,
    admin,
    validate(createProductSchema),
    create
);

router.get(
    "/",
    protect,
    validate(getProductsSchema, "query"),
    getAll
);

router.get(
    "/:id",
    protect,
    validate(getProductByIdSchema, "params"),
    getById
);

router.put(
    "/:id",
    protect,
    admin,
    validate(getProductByIdSchema, "params"),
    validate(updateProductSchema),
    update
);

router.delete(
    "/:id",
    protect,
    admin,
    validate(deleteProductSchema, "params"),
    deleteProd
);

export default router;