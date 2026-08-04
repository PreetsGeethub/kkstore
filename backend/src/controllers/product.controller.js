import { createProduct , getProducts} from "../services/product.service.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

export const create = asyncHandler(async (req, res) => {
    const product = await createProduct(req.validated.body);

    res.status(201).json(
        new ApiResponse(
            201,
            "Product created successfully.",
            product
        )
    );
});

export const getAll = asyncHandler(async (req, res) => {
    const products = await getProducts(req.validated.query);

    return res.status(200).json(
        new ApiResponse(
            200,
            "Products fetched successfully.",
            products
        )
    );
});