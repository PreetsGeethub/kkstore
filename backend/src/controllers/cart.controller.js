import ApiResponse from "../utils/ApiResponse.js";
import { createCart, getCart, updateCart, deleteCartItem, clearCart  } from "../services/cart.service.js";
import asyncHandler from "../utils/asyncHandler.js";


export const createCartController =  asyncHandler(async (req, res) => {
    const { variantId, quantity } = req.validated.body;
    const userId = req.user.id;

    const cartItem = await createCart(userId, variantId, quantity);

    res.status(201).json(
        new ApiResponse(
            201,
            "Cart item created successfully.",
            cartItem
        )
    );
}

);

export const getCartController = asyncHandler(async (req, res) => {
    const userId = req.user.id;

    const cart = await getCart(userId);

    res.status(200).json(
        new ApiResponse(
            200,
            "Cart fetched successfully.",
            cart
        )
    );
});

export const updateCartController = asyncHandler(async (req, res) => {
    
    const { variantId } = req.validated.params;
    const { quantity } = req.validated.body;
    const userId = req.user.id;

    const updatedCartItem = await updateCart(userId, variantId, quantity);

    res.status(200).json(
        new ApiResponse(
            200,
            "Cart item updated successfully.",
            updatedCartItem
        )
    );
});

export const deleteCartItemController = asyncHandler(async (req, res) => {
    const { variantId } = req.validated.params;
    const userId = req.user.id;

    await deleteCartItem(userId, variantId);

    res.status(200).json(
        new ApiResponse(
            200,
            "Cart item deleted successfully.",
            null
        )
    );
});

export const clearCartController = asyncHandler(async (req, res) => {
    const userId = req.user.id;

    await clearCart(userId);

    res.status(200).json(
        new ApiResponse(
            200,
            "Cart cleared successfully.",
            null
        )
    );
});