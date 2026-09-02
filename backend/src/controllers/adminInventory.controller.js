import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";

import {
    getInventory,
    updateInventory,
} from "../services/adminInventory.service.js";


export const getInventoryController = asyncHandler(
    async (req, res) => {
        const inventoryData = req.validated.query;

        const result = await getInventory(inventoryData);

        return res.status(200).json(
            new ApiResponse(
                200,
                "Inventory fetched successfully.",
                result
            )
        );
    }
);


export const updateInventoryController = asyncHandler(
    async (req, res) => {
        const { variantId } = req.validated.params;
        const { stock } = req.validated.body;

        const updatedVariant = await updateInventory(
            variantId,
            stock
        );

        return res.status(200).json(
            new ApiResponse(
                200,
                "Inventory updated successfully.",
                updatedVariant
            )
        );
    }
);