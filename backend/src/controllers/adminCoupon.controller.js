import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";

import {
    createCoupon,
    getCoupons,
    getCouponById,
    updateCoupon,
    deleteCoupon,
} from "../services/coupon.service.js";


export const create = asyncHandler(async (req, res) => {
    const coupon = await createCoupon(
        req.validated.body
    );

    return res.status(201).json(
        new ApiResponse(
            201,
            "Coupon created successfully.",
            coupon
        )
    );
});


export const getAll = asyncHandler(async (req, res) => {
    const result = await getCoupons(
        req.validated.query
    );

    return res.status(200).json(
        new ApiResponse(
            200,
            "Coupons fetched successfully.",
            result
        )
    );
});


export const getById = asyncHandler(async (req, res) => {
    const { id } = req.validated.params;

    const coupon = await getCouponById(id);

    return res.status(200).json(
        new ApiResponse(
            200,
            "Coupon fetched successfully.",
            coupon
        )
    );
});


export const update = asyncHandler(async (req, res) => {
    const { id } = req.validated.params;

    const coupon = await updateCoupon(
        id,
        req.validated.body
    );

    return res.status(200).json(
        new ApiResponse(
            200,
            "Coupon updated successfully.",
            coupon
        )
    );
});


export const deleteCouponController = asyncHandler(
    async (req, res) => {
        const { id } = req.validated.params;

        const coupon = await deleteCoupon(id);

        return res.status(200).json(
            new ApiResponse(
                200,
                "Coupon deactivated successfully.",
                coupon
            )
        );
    }
);