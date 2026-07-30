import { createCategory, getCategories,getCategoryById, updateCategory, deleteCategory } from "../services/category.service.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

export const create = asyncHandler( async ( req, res) => {
    const category = await createCategory(req.validated.body);
    res.status(201).json(
        new  ApiResponse(
            201,
            "Category created successfully",
            category
        )
    )
})

export const getAllCategory = asyncHandler( async (req, res) => {
    
    const { categories, pagination } = await getCategories(
        req.validated.query
    );
    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            "categories fetched successfully !!",
            {categories,pagination}
        )
    )
})

export const getCategoryId  = asyncHandler( async ( req, res) => {
    const {id} = req.validated.params;
    const category = await getCategoryById(id);
    return res.status(200).json(
        new ApiResponse(
            200,
            "Category fetched successfully.",
            category
        )
    );
})

export const update = asyncHandler( async (req, res) => {
    const data = req.validated.body;
    const {id} = req.validated.params;
    const updatedCategory  = await updateCategory(data,id);
    return res.status(200).json(
        new ApiResponse(
            200,
            "Catgory updated successfully",
            updatedCategory,          
        )
    )
})

export const deleteCat = asyncHandler( async( req, res) => {
    const {id} = req.validated.params;
    const deletedCategory  = await deleteCategory(id);
    return res.status(200).json(
        new ApiResponse(
            200,
            "Category deleted successfully",
            deletedCategory 
        )
    );
})