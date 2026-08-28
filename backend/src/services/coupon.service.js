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


export const createCoupon = async (couponData) => {
    const existingCoupon = await prisma.coupon.findUnique({
        where: {
            code: couponData.code,
        },
    });

    if (existingCoupon) {
        throw new ApiError(
            409,
            "Coupon with this code already exists."
        );
    }

    if (couponData.expiresAt <= couponData.startsAt) {
        throw new ApiError(
            400,
            "Expiry date must be after start date."
        );
    }

    if (
        couponData.discountType === "PERCENTAGE" &&
        couponData.discountValue > 100
    ) {
        throw new ApiError(
            400,
            "Percentage discount cannot exceed 100."
        );
    }

    const coupon = await prisma.coupon.create({
        data: {
            code: couponData.code,
            discountType: couponData.discountType,
            discountValue: couponData.discountValue,
            minimumOrderAmount:
                couponData.minimumOrderAmount ?? null,
            usageLimit:
                couponData.usageLimit ?? null,
            startsAt: couponData.startsAt,
            expiresAt: couponData.expiresAt,
            isActive:
                couponData.isActive ?? true,
        },
    });

    return coupon;
};


export const getCoupons = async ({
    page,
    limit,
    search,
    status,
}) => {
    const where = {};

    if (search) {
        where.code = {
            contains: search,
            mode: "insensitive",
        };
    }

    if (status !== "all") {
        where.isActive = status === "active";
    }

    const skip = (page - 1) * limit;

    const [coupons, totalCoupons] = await Promise.all([
        prisma.coupon.findMany({
            where,
            orderBy: {
                createdAt: "desc",
            },
            skip,
            take: limit,
        }),

        prisma.coupon.count({
            where,
        }),
    ]);

    const totalPages = Math.ceil(
        totalCoupons / limit
    );

    return {
        coupons,
        pagination: {
            total: totalCoupons,
            page,
            limit,
            totalPages,
            hasNextPage: page < totalPages,
            hasPreviousPage: page > 1,
        },
    };
};


export const getCouponById = async (id) => {
    const coupon = await prisma.coupon.findUnique({
        where: {
            id,
        },
    });

    if (!coupon) {
        throw new ApiError(
            404,
            "Coupon not found."
        );
    }

    return coupon;
};


export const updateCoupon = async (id, data) => {
    const existingCoupon = await prisma.coupon.findUnique({
        where: {
            id,
        },
    });

    if (!existingCoupon) {
        throw new ApiError(
            404,
            "Coupon not found."
        );
    }

    if (
        data.code &&
        data.code !== existingCoupon.code
    ) {
        const duplicateCoupon =
            await prisma.coupon.findUnique({
                where: {
                    code: data.code,
                },
            });

        if (duplicateCoupon) {
            throw new ApiError(
                409,
                "Coupon with this code already exists."
            );
        }
    }

    const startsAt =
        data.startsAt ?? existingCoupon.startsAt;

    const expiresAt =
        data.expiresAt ?? existingCoupon.expiresAt;

    if (expiresAt <= startsAt) {
        throw new ApiError(
            400,
            "Expiry date must be after start date."
        );
    }

    const discountType =
        data.discountType ??
        existingCoupon.discountType;

    const discountValue =
        data.discountValue ??
        existingCoupon.discountValue;

    if (
        discountType === "PERCENTAGE" &&
        Number(discountValue) > 100
    ) {
        throw new ApiError(
            400,
            "Percentage discount cannot exceed 100."
        );
    }

    return await prisma.coupon.update({
        where: {
            id,
        },
        data,
    });
};


export const deleteCoupon = async (id) => {
    const coupon = await prisma.coupon.findUnique({
        where: {
            id,
        },
    });

    if (!coupon) {
        throw new ApiError(
            404,
            "Coupon not found."
        );
    }

    if (!coupon.isActive) {
        throw new ApiError(
            409,
            "Coupon is already inactive."
        );
    }

    return await prisma.coupon.update({
        where: {
            id,
        },
        data: {
            isActive: false,
        },
    });
};