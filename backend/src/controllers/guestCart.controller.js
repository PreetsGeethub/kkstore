import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import {
    addGuestCartItem,
    getGuestCart,
    updateGuestCartItem,
    removeGuestCartItem,
    clearGuestCart,
} from "../services/guestCart.service.js";
import {
    guestCartTokenOptions,
} from "../utils/token.js";


export const getGuestCartController = asyncHandler(async (req, res) => {
    const guestToken = req.cookies.guestCartToken;

    const {
        cart,
        guestToken: resolvedGuestToken,
    } = await getGuestCart(guestToken);

    return res
        .cookie(
            "guestCartToken",
            resolvedGuestToken,
            guestCartTokenOptions
        )
        .status(200)
        .json(
            new ApiResponse(
                200,
                "Guest cart fetched successfully.",
                cart
            )
        );
});


export const addGuestCartItemController = asyncHandler(async (req, res) => {
    const guestToken = req.cookies.guestCartToken;

    const { variantId, quantity } = req.validated.body;

    const {
        item,
        guestToken: resolvedGuestToken,
    } = await addGuestCartItem(
        guestToken,
        variantId,
        quantity
    );

    return res
        .cookie(
            "guestCartToken",
            resolvedGuestToken,
            guestCartTokenOptions
        )
        .status(201)
        .json(
            new ApiResponse(
                201,
                "Guest cart item added successfully.",
                item
            )
        );
});


export const updateGuestCartItemController = asyncHandler(
    async (req, res) => {
        const guestToken = req.cookies.guestCartToken;

        const { itemId } = req.validated.params;
        const { quantity } = req.validated.body;

        const {
            item,
            guestToken: resolvedGuestToken,
        } = await updateGuestCartItem(
            guestToken,
            itemId,
            quantity
        );

        return res
            .cookie(
                "guestCartToken",
                resolvedGuestToken,
                guestCartTokenOptions
            )
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    "Guest cart item updated successfully.",
                    item
                )
            );
    }
);


export const removeGuestCartItemController = asyncHandler(
    async (req, res) => {
        const guestToken = req.cookies.guestCartToken;
        const { itemId } = req.validated.params;

        const {
            item,
            guestToken: resolvedGuestToken,
        } = await removeGuestCartItem(
            guestToken,
            itemId
        );

        return res
            .cookie(
                "guestCartToken",
                resolvedGuestToken,
                guestCartTokenOptions
            )
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    "Guest cart item removed successfully.",
                    item
                )
            );
    }
);


export const clearGuestCartController = asyncHandler(
    async (req, res) => {
        const guestToken = req.cookies.guestCartToken;

        const {
            deletedCount,
            guestToken: resolvedGuestToken,
        } = await clearGuestCart(guestToken);

        return res
            .cookie(
                "guestCartToken",
                resolvedGuestToken,
                guestCartTokenOptions
            )
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    "Guest cart cleared successfully.",
                    {
                        deletedCount,
                    }
                )
            );
    }
);