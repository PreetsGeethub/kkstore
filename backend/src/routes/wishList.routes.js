import {Router} from 'express';
import { create, getAll, deletedWishlistItem } from '../controllers/wishList.controller.js';
import { createWishlistSchema, deleteWishlistSchema } from '../validators/wishList.validator.js';
import validate from "../middleware/validate.middleware.js";
import protect from '../middleware/protect.middleware.js';
const router = Router();

router.post(
    "/",
    protect,
    validate(createWishlistSchema),
    create
);

router.get(
    "/",
    protect,
    getAll
);

router.delete(
    "/:productId",
    protect,
    validate(deleteWishlistSchema, "params"),
    deletedWishlistItem
);

export default router;