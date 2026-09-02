import { OrderStatus, PaymentStatus } from "../../generated/prisma/index.js";
import prisma from "../config/prisma.js";
import ApiError from "../utils/ApiError.js";



export const createReview = async (userId, reviewData) => {
    const {
        productId,
        rating,
        title,
        comment,
    } = reviewData;

    // 1. Product exists
    const product = await prisma.product.findUnique({
        where: {
            id: productId,
        },
        select: {
            id: true,
        },
    });

    if (!product) {
        throw new ApiError(
            404,
            "Product does not exist."
        );
    }

    // 2. User hasn't already reviewed it
    const existingReview = await prisma.review.findUnique({
        where: {
            userId_productId: {
                userId,
                productId,
            },
        },
    });

    if (existingReview) {
        throw new ApiError(
            409,
            "You have already reviewed this product."
        );
    }

    // 3. User purchased the product
    const paidOrder = await prisma.order.findFirst({
        where: {
            userId,
            status: OrderStatus.PAID,
            orderItems: {
                some: {
                    variant: {
                        productId: productId,
                    },
                },
            },
        },
    });

    if (!paidOrder) {
        throw new ApiError(
            403,
            "You can only review products you have purchased."
        );
    }

    // 4. Create verified review
    const review = await prisma.review.create({
        data: {
            userId,
            productId,
            title,
            comment,
            rating,
            isVerifiedPurchase: true,
        },
    });

    return review;
};

export const getProductReviews = async (productId) => {
    const product = await prisma.product.findUnique({
        where: {
            id: productId,
        },
        select: {
            id: true,
        },
    });

    if (!product) {
        throw new ApiError(
            404,
            "Product not found."
        );
    }

    const reviews = await prisma.review.findMany({
        where: {
            productId,
        },
        orderBy: {
            createdAt: "desc",
        },
        select: {
            id: true,
            rating: true,
            title: true,
            comment: true,
            isVerifiedPurchase: true,
            createdAt: true,

            user: {
                select: {
                    firstName: true,
                    lastName: true,
                },
            },
        },
    });

    return reviews;
};


export const updateReview = async (userId, reviewId, reviewData) => {
    const review = await prisma.review.findFirst({
        where: {
            id: reviewId,
            userId,
        },
        select: {
            id: true,
        },
    });

    if (!review) {
        throw new ApiError(
            404,
            "Review not found."
        );
    }

    const updatedReview = await prisma.review.update({
        where: {
            id: review.id,
        },
        data: reviewData,
    });

    return updatedReview;
};

export const deleteReview = async (userId, reviewId) => {
    const review = await prisma.review.findFirst({
        where: {
            id: reviewId,
            userId,
        },
        select: {
            id: true,
        },
    });

    if (!review) {
        throw new ApiError(
            404,
            "Review not found."
        );
    }

    const deletedReview = await prisma.review.delete({
        where: {
            id: review.id,
        },
    });

    return deletedReview;
};

export const getAllReviews = async ({
    page,
    limit,
    search,
    rating,
}) => {
    const where = {};

    if (rating !== "all") {
        where.rating = Number(rating);
    }

    if (search) {
        where.OR = [
            {
                comment: {
                    contains: search,
                    mode: "insensitive",
                },
            },
            {
                title: {
                    contains: search,
                    mode: "insensitive",
                },
            },
            {
                product: {
                    name: {
                        contains: search,
                        mode: "insensitive",
                    },
                },
            },
        ];
    }

    const skip = (page - 1) * limit;

    const [reviews, totalReviews] = await Promise.all([
        prisma.review.findMany({
            where,
            orderBy: {
                createdAt: "desc",
            },
            skip,
            take: limit,
            select: {
                id: true,
                rating: true,
                title: true,
                comment: true,
                isVerifiedPurchase: true,
                createdAt: true,

                user: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                    },
                },

                product: {
                    select: {
                        id: true,
                        name: true,
                        slug: true,
                    },
                },
            },
        }),

        prisma.review.count({
            where,
        }),
    ]);

    const totalPages = Math.ceil(totalReviews / limit);

    return {
        reviews,
        pagination: {
            total: totalReviews,
            page,
            limit,
            totalPages,
            hasNextPage: page < totalPages,
            hasPreviousPage: page > 1,
        },
    };
};


export const getAdminReviewById = async (reviewId) => {
    const review = await prisma.review.findUnique({
        where: {
            id: reviewId,
        },
        select: {
            id: true,
            rating: true,
            title: true,
            comment: true,
            isVerifiedPurchase: true,
            createdAt: true,
            updatedAt: true,

            user: {
                select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    email: true,
                },
            },

            product: {
                select: {
                    id: true,
                    name: true,
                    slug: true,
                },
            },
        },
    });

    if (!review) {
        throw new ApiError(
            404,
            "Review not found."
        );
    }

    return review;
};


export const deleteAdminReview = async (reviewId) => {
    const review = await prisma.review.findUnique({
        where: {
            id: reviewId,
        },
        select: {
            id: true,
        },
    });

    if (!review) {
        throw new ApiError(
            404,
            "Review not found."
        );
    }

    const deletedReview = await prisma.review.delete({
        where: {
            id: reviewId,
        },
    });

    return deletedReview;
};