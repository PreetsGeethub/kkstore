import { Router } from "express";
import { create } from "../controllers/product.controller.js";
import validate from "../middleware/validate.middleware.js";
import { createProductSchema } from "../validators/product.validator.js";

const router = Router();

router.post(
    "/",
    validate(createProductSchema),
    create
);

export default router;