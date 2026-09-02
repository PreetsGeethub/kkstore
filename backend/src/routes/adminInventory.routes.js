import { Router } from "express";

import protect from "../middleware/protect.middleware.js";
import admin from "../middleware/admin.middleware.js";
import validate from "../middleware/validate.middleware.js";

import {
    getInventoryController,
    updateInventoryController,
} from "../controllers/adminInventory.controller.js";

import {
    getInventorySchema,
    inventoryVariantIdSchema,
    updateInventorySchema,
} from "../validators/adminInventory.validator.js";

const router = Router();


// Get inventory
router.get(
    "/",
    protect,
    admin,
    validate(getInventorySchema, "query"),
    getInventoryController
);


// Update variant stock
router.patch(
    "/:variantId",
    protect,
    admin,
    validate(inventoryVariantIdSchema, "params"),
    validate(updateInventorySchema, "body"),
    updateInventoryController
);


export default router;