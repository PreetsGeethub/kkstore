import { Router } from "express";
import validate from "../middleware/validate.middleware.js";

import {
    getGuestCartController,
    addGuestCartItemController,
    updateGuestCartItemController,
    removeGuestCartItemController,
    clearGuestCartController,
} from "../controllers/guestCart.controller.js";

import {
    addGuestCartItemSchema,
    updateGuestCartItemSchema,
    guestCartItemParamsSchema,
} from "../validators/guestCart.validator.js";

const router = Router();

router.get(
    "/",
    getGuestCartController
);

router.post(
    "/items",
    validate(addGuestCartItemSchema),
    addGuestCartItemController
);

router.patch(
    "/items/:itemId",
    validate(guestCartItemParamsSchema, "params"),
    validate(updateGuestCartItemSchema),
    updateGuestCartItemController
);

router.delete(
    "/items/:itemId",
    validate(guestCartItemParamsSchema, "params"),
    removeGuestCartItemController
);

router.delete(
    "/",
    clearGuestCartController
);

export default router;