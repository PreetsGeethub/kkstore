import {Router}  from 'express';
import { createOrderController, getOrderController, getOrderByIdController, cancelOrderController } from '../controllers/order.controller.js';
import { createOrderSchema,cancelOrderSchema,getOrderByIdSchema } from '../validators/order.validator.js';

import validate from "../middleware/validate.middleware.js";
import protect from "../middleware/protect.middleware.js";


const router = Router();

router.post( 
    "/",
    protect,
    validate(createOrderSchema),
    createOrderController
);

router.get(
    "/",
    protect,
    getOrderController
);

router.get(
    "/:orderId",
    protect,
    validate(getOrderByIdSchema, "params"),
    getOrderByIdController
);

router.delete(
    "/:orderId",
    protect,
    validate(cancelOrderSchema, "params"),
    cancelOrderController
);

export default router;