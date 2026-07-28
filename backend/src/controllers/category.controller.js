import { createCategory } from "../services/category.service.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

export const create = asyncHandler( async ( req, res) => {
    const category = await createCategory(req.body);
    res.status(201).json(
        new  ApiResponse(
            201,
            "Category created successfully",
            category
        )
    )
})