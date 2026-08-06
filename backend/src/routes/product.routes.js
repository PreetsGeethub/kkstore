import { Router } from "express";
import { create,update,getAll,getById,deleteProd } from "../controllers/product.controller.js";
import validate from "../middleware/validate.middleware.js";
import { createProductSchema , updateProductSchema, getProductByIdSchema, getProductsSchema,deleteProductSchema} from "../validators/product.validator.js";

const router = Router();

router.post(
    "/",
    validate(createProductSchema),
    create
);
router.get(
    "/",
    validate(getProductsSchema, "query"),
    getAll
);
router.get(
    "/:id",
    validate(getProductByIdSchema, "params"),
    getById
);
router.put(
    "/:id",
    validate(getProductByIdSchema, "params"),
    validate(updateProductSchema),
    update
);
router.delete(
    "/:id",
    validate(deleteProductSchema, "params"),
    deleteProd
);
export default router;