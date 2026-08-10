import { Router } from "express";

import {
    createCartController,
    getCartController,
    updateCartController,
    deleteCartItemController,
    clearCartController,
} from "../controllers/cart.controller.js";

import {
    createCartSchema,
    updateCartSchema,
    updateCartParamsSchema,
    deleteCartItemSchema,
} from "../validators/cart.validator.js";

import validate from "../middleware/validate.middleware.js";
import protect from "../middleware/protect.middleware.js";

const router = Router();

// Add item to cart
router.post(
    "/",
    protect,
    validate(createCartSchema),
    createCartController
);

// Get current user's cart
router.get(
    "/",
    protect,
    getCartController
);

// Update quantity of a cart item
router.patch(
    "/:variantId",
    protect,
    validate(updateCartParamsSchema,"params"),
    validate(updateCartSchema),
    updateCartController
);

// Remove a single item from cart
router.delete(
    "/:variantId",
    protect,
    validate(deleteCartItemSchema, "params"),
    deleteCartItemController
);

// Clear entire cart
router.delete(
    "/",
    protect,
    clearCartController
);

export default router;