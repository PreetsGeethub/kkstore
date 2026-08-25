import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import { Prisma } from "../../generated/prisma/index.js";
import { validateCoupon } from "../services/coupon.service.js";

export const validateCouponController = asyncHandler(async (req, res) => {
    const { code, subtotal } = req.validated.body;

    const userId = req.user?.id ?? null;

    const { coupon, discountAmount } = await validateCoupon(
        code,
        new Prisma.Decimal(subtotal),
        userId
    );

    return res.status(200).json(
        new ApiResponse(
            200,
            "Coupon applied successfully.",
            {
                coupon: {
                    id: coupon.id,
                    code: coupon.code,
                    discountType: coupon.discountType,
                    discountValue: coupon.discountValue,
                },
                discountAmount,
            }
        )
    );
});