import prisma from "../config/prisma.js";
import { createProduct, getProducts, getProductById, updateProduct, deleteProduct } from "../services/product.service.js";
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

export const getById = asyncHandler(async (req, res) => {
    const product = await getProductById(req.validated.params.id);

    return res.status(200).json(
        new ApiResponse(
            200,
            "Product fetched successfully.",
            product
        )
    );
});

export const update = asyncHandler(async (req, res) => {
    const updatedProduct = await updateProduct(req.validated.params.id, req.validated.body);
    return res.status(200).json(new ApiResponse(
        200,
        "Product updated successfully.",
        updatedProduct
    )
    )
});

export const deleteProd = asyncHandler(async (req, res) => {
    const deletedProduct = await deleteProduct(req.validated.params.id);
    return res.status(200).json(new ApiResponse(
        200,
        "Product deleted successfully.",
        deletedProduct
    )
    )
}
);

