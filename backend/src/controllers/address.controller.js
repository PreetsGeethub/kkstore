import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";

import {
    createAddress,
    getAddresses,
    getAddressById,
    updateAddress,
    deleteAddress,
} from "../services/address.service.js";

export const createAddressController = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const addressData = req.validated.body;

    const address = await createAddress(userId, addressData);

    return res.status(201).json(
        new ApiResponse(
            201,
            "Address created successfully.",
            address
        )
    );
});

export const getAddressesController = asyncHandler(async (req, res) => {
    const userId = req.user.id;

    const addresses = await getAddresses(userId);

    return res.status(200).json(
        new ApiResponse(
            200,
            "Addresses fetched successfully.",
            addresses
        )
    );
});

export const getAddressByIdController = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { addressId } = req.validated.params;

    const address = await getAddressById(userId, addressId);

    return res.status(200).json(
        new ApiResponse(
            200,
            "Address fetched successfully.",
            address
        )
    );
});

export const updateAddressController = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { addressId } = req.validated.params;
    const addressData = req.validated.body;

    const address = await updateAddress(
        userId,
        addressId,
        addressData
    );

    return res.status(200).json(
        new ApiResponse(
            200,
            "Address updated successfully.",
            address
        )
    );
});

export const deleteAddressController = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { addressId } = req.validated.params;

    const address = await deleteAddress(
        userId,
        addressId
    );

    return res.status(200).json(
        new ApiResponse(
            200,
            "Address deleted successfully.",
            address
        )
    );
});