import { getWishList, deleteWishList, createWishList } from "../services/wishList.service.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";


export const create = asyncHandler(async (req, res) => {
    const wishlistItem = await createWishList(req.user.id, req.validated.body.productId);

    return res.status(201).json(
        new ApiResponse(
            201,
            "Product added to wishlist successfully.",
            wishlistItem
        )
    );
});

export const getAll = asyncHandler ( async (req, res) =>{
    const wishlistItems = await getWishList(req.user.id);
    return res.status(200).json(
        new ApiResponse(
            200,
            "Products fetched successfully !!",
            wishlistItems
        )
    )
});

export const deletedWishlistItem = asyncHandler(async (req, res) => {
    const deletedWishlistItem = await deleteWishList(
        req.user.id,
        req.validated.params.productId
    );

    return res.status(200).json(
        new ApiResponse(
            200,
            "Product removed from wishlist successfully.",
            deletedWishlistItem
        )
    );
});