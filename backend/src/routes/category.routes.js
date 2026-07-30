import {Router} from "express";
import validate from "../middleware/validate.middleware.js";
import { createCategorySchema,updateCategorySchema ,getCategoriesSchema,getCategoryByIdSchema,deleteCategorySchema} from "../validators/category.validator.js";
import { create,getAllCategory, getCategoryId, update, deleteCat } from "../controllers/category.controller.js";

const router = Router();


router.post("/", validate(createCategorySchema), create);

router.get("/", validate(getCategoriesSchema, "query"), getAllCategory);

router.get(
    "/:id",
    validate(getCategoryByIdSchema, "params"),
    getCategoryId
);

router.patch(
    "/:id",
    validate(getCategoryByIdSchema, "params"),
    validate(updateCategorySchema, "body"),
    update
);

router.delete(
    "/:id",
    validate(deleteCategorySchema, "params"),
    deleteCat
);

export default router