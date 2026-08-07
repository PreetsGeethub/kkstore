import { id } from "zod/v4/locales";
import prisma from "../config/prisma.js";
import ApiError from "../utils/ApiError.js";
import { generateSlug } from "../utils/generateSlug.js";

export const createWishList = async (userId, productId) => {
    // Check if the product exists
    const product = await prisma.product.findUnique({
        where: { id: productId },
    });

    if (!product) {
        throw new ApiError(404, "Product not found.");
    }

    if (!product.status) {
        throw new ApiError(404, "Product is unavailable.");
    }

    // Check if the wishlist item already exists for the user
    const existingWishlistItem = await prisma.wishlistItem.findUnique({
        where: {
            userId_productId: {
                userId,
                productId,
            },
        }
    });

    if (existingWishlistItem) {
        throw new ApiError(409, "Product is already in the wishlist.");
    }

    // Create a new wishlist item
    const wishlistItem = await prisma.wishlistItem.create({
        data: {
            userId,
            productId,
        },
        include: {
            product: {
                select: {
                    id: true,
                    name: true,
                    slug: true,
                },
            },
        },
    });

    return wishlistItem;
}

export const deleteWishList = async (userId, productId) => {
    // Check if the wishlist item exists for the user
    const existingWishlistItem = await prisma.wishlistItem.findUnique({
        where: {
            userId_productId: {
                userId,
                productId,
            },
        }
    });

    if (!existingWishlistItem) {
        throw new ApiError(404, "Product is not in the wishlist.");
    }

    // Delete the wishlist item
    const deletedWishlistItem = await prisma.wishlistItem.delete({
        where: {
            userId_productId: {
                userId,
                productId,
            },
        },
    });

    return deletedWishlistItem;
}

export const getWishList = async (userId) => {
    // Fetch all wishlist items for the user
    const wishlistItems = await prisma.wishlistItem.findMany({
        where: {
            userId,
            product: {
                status: true, // Only include products that are available
            },
        },
        select: {
            id: true,
            createdAt: true,
            product: {
                select: {
                    id: true,
                    name: true,
                    slug: true,
                    status: true,
            
                    images: {
                        select: {
                            imageUrl: true,
                        },
                        orderBy: {
                            sortOrder: "asc",
                        },
                        take: 1,
                    },
            
                    variants: {
                        select: {
                            price: true,
                            stock: true,
                        },
                    },
                },
            },
        },
    });

    return wishlistItems;
}