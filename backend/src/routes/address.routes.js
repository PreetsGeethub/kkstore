import { Router } from "express";
import protect from "../middleware/protect.middleware.js";
import validate from "../middleware/validate.middleware.js";

import {
    createAddressController,
    getAddressesController,
    getAddressByIdController,
    updateAddressController,
    deleteAddressController,
} from "../controllers/address.controller.js";

import {
    createAddressSchema,
    updateAddressSchema,
    addressIdSchema,
} from "../validators/address.validator.js";

const router = Router();

router.use(protect);

router.post(
    "/",
    validate(createAddressSchema),
    createAddressController
);

router.get(
    "/",
    getAddressesController
);

router.get(
    "/:addressId",
    validate(addressIdSchema, "params"),
    getAddressByIdController
);

router.patch(
    "/:addressId",
    validate(addressIdSchema, "params"),
    validate(updateAddressSchema),
    updateAddressController
);

router.delete(
    "/:addressId",
    validate(addressIdSchema, "params"),
    deleteAddressController
);

export default router;