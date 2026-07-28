import { createProduct } from "../services/product.service.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

export const create = asyncHandler(async (req, res) => {
    const product = await createProduct(req.body);

    res.status(201).json(
        new ApiResponse(
            201,
            "Product created successfully.",
            product
        )
    );
});