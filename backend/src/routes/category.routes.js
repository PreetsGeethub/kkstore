import {Router} from "express";
import validate from "../middleware/validate.middleware.js";
import { createCategorySchema,updateCategorySchema } from "../validators/category.validator.js";
import { create } from "../controllers/category.controller.js";

const router = Router();


router.post("/",validate(createCategorySchema),create);

export default router;