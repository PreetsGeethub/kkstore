import prisma from "../config/prisma.js";
import ApiError from "../utils/ApiError.js";

export const validateCoupon = async (code, subtotal, userId) => {
    const coupon = await prisma.coupon.findUnique({
        where: { code },
    })
    if (!coupon) {
        throw new ApiError(404, "Coupon not found.");
    }
    const currentDate = new Date();
    if (currentDate < coupon.startsAt || currentDate > coupon.expiresAt || !coupon.isActive) {
        throw new ApiError(404, "This coupon cannot be applied");
    }

    if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit) {
        throw new ApiError(
            409,
            "Coupon usage limit has been reached."
        );
    }

    if (
        coupon.minimumOrderAmount !== null &&
        subtotal.lt(coupon.minimumOrderAmount)
    ) {
        throw new ApiError(
            400,
            "Minimum order amount not met."
        );
    }

    if(!userId){
        throw new ApiError(401,"Sign up to apply this coupon")
    }
    const isUsed = await prisma.couponUsage.findUnique({
        where: {
            couponId_userId: {
                couponId: coupon.id,
                userId,
            },
        },
    }); 
    if (isUsed) {
        throw new ApiError(404, "This coupon is already used")
    }
    let discountAmount;

    if (coupon.discountType === "FIXED") {
        discountAmount = coupon.discountValue;
    } else {
        discountAmount = subtotal
            .mul(coupon.discountValue)
            .div(100);
    }

    if (discountAmount.gt(subtotal)) {
        discountAmount = subtotal;
    }

    return {
        coupon,
        discountAmount,
    };
}