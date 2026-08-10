import { id, ta } from "zod/v4/locales";
import prisma from "../config/prisma.js";
import ApiError from "../utils/ApiError.js";
import { generateSlug } from "../utils/generateSlug.js";
import { includes } from "zod";


export const createCart = async (userId, variantId, quantity) => {

    return await prisma.$transaction(async (tx) => {
        const variant = await tx.variant.findUnique({
            where: { id: variantId },
            include: {
                product: {
                    select: {
                        id: true,
                        name: true,
                        slug: true,
                        status: true,
                    },
                },
            },
        });

        if (!variant) {
            throw new ApiError(404, "Variant not found.");
        }

        if (!variant.product.status) {
            throw new ApiError(404, "Product is unavailable.");
        }

        if (quantity > variant.stock) {
            throw new ApiError(400, "Quantity exceeds available stock.");
        }


        // Find user's cart
        const existingCart = await tx.cart.findUnique({
            where: { userId },
        });

        // User already has a cart
        if (existingCart) {

            const existingCartItem = await tx.cartItem.findUnique({
                where: {
                    cartId_variantId: {
                        cartId: existingCart.id,
                        variantId,
                    },
                },
            });

            // Variant not already in cart
            if (!existingCartItem) {

                return await tx.cartItem.create({
                    data: {
                        cartId: existingCart.id,
                        variantId,
                        quantity,
                    },
                    include: {
                        variant: {
                            include: {
                                product: true,
                            },
                        },
                    },
                });
            }

            // Prevent quantity from exceeding stock
            if (existingCartItem.quantity + quantity > variant.stock) {
                throw new ApiError(
                    400,
                    "Quantity exceeds available stock."
                );
            }

            // Update existing cart item
            return await tx.cartItem.update({
                where: {
                    cartId_variantId: {
                        cartId: existingCart.id,
                        variantId,
                    },
                },
                data: {
                    quantity: existingCartItem.quantity + quantity,
                },
                include: {
                    variant: {
                        include: {
                            product: true,
                        },
                    },
                },
            });
        }

        // User doesn't have a cart yet
        return await tx.cart.create({
            data: {
                userId,
                cartItems: {
                    create: {
                        variantId,
                        quantity,
                    },
                },
            },
            include: {
                cartItems: {
                    include: {
                        variant: {
                            include: {
                                product: true,
                            },
                        },
                    },
                },
            },
        });
    });
};

export const getCart = async (userId) => {
    const cart = await prisma.cart.findUnique({
        where: { userId },
        include: {
            cartItems: {
                include: {
                    variant: {
                        include: {
                            product: {
                                include: {
                                    images: {
                                        orderBy: {
                                            sortOrder: "asc",
                                        },
                                        take: 1,
                                    },
                                },
                            },
                        },
                    },
                },
            },
        },
    });

    if (!cart) {
        return {
            cartItems: [],
            totalItems: 0,
            subtotal: 0,
        };
    }

    const totalItems = cart.cartItems.reduce(
        (acc, item) => acc + item.quantity,
        0
    );

    const subtotal = cart.cartItems.reduce(
        (acc, item) => acc + Number(item.variant.price) * item.quantity,
        0
    );

    return {
        cartItems: cart.cartItems,
        totalItems,
        subtotal,
    };
};

export const updateCart = async (userId, variantId, quantity) => {

    return await prisma.$transaction(async (tx) => {
        const variant = await tx.variant.findUnique({
            where: { id: variantId },
            include: {
                product: {
                    select: {
                        id: true,
                        name: true,
                        slug: true,
                        status: true,
                    },
                },
            },
        });

        if (!variant) {
            throw new ApiError(404, "Variant not found.");
        }

        if (!variant.product.status) {
            throw new ApiError(404, "Product is unavailable.");
        }

        const existingCart = await tx.cart.findUnique({
            where: { userId },
        });

        if (!existingCart) {
            throw new ApiError(404, "Cart not found.");
        }


        const existingCartItem = await tx.cartItem.findUnique({
            where: {
                cartId_variantId: {
                    cartId: existingCart.id,
                    variantId,
                },
            },
        });

        if (!existingCartItem) {
            throw new ApiError(404, "Cart item not found.");

        }
        if (quantity < 0) {
            throw new ApiError(400, "Quantity must be a positive number.");
        }
        if (quantity === 0) {
            await tx.cartItem.delete({
                where: {
                    cartId_variantId: {
                        cartId: existingCart.id,
                        variantId,
                    },
                },
            });
            return null;
        }
       
        if (quantity > variant.stock) {
            throw new ApiError(400, "Quantity exceeds available stock.");
        }

        return await tx.cartItem.update({
            where: {
                cartId_variantId: {
                    cartId: existingCart.id,
                    variantId,
                },
            },
            data: { quantity },
            include: {
                variant: {
                    select: {
                        id: true,
                        color: true,
                        size: true,
                        price: true,
                        stock: true,

                        product: {
                            select: {
                                id: true,
                                name: true,
                                slug: true,

                                images: {
                                    take: 1,
                                    orderBy: {
                                        sortOrder: "asc",
                                    },
                                    select: {
                                        imageUrl: true,
                                    },
                                },
                            },
                        },
                    },
                },
            },
        });
    });
}


export const deleteCartItem = async (userId, variantId) => {
    return await prisma.$transaction(async (tx) => {
        const existingCart = await tx.cart.findUnique({
            where: { userId },
        });

        if (!existingCart) {
            throw new ApiError(404, "Cart not found.");
        }

        const existingCartItem = await tx.cartItem.findUnique({
            where: {
                cartId_variantId: {
                    cartId: existingCart.id,
                    variantId,
                },
            },
        });

        if (!existingCartItem) {
            throw new ApiError(404, "Cart item not found.");
        }

        await tx.cartItem.delete({
            where: {
                cartId_variantId: {
                    cartId: existingCart.id,
                    variantId,
                },
            },
        });

        return null;
    });
}


export const clearCart = async (userId) => {
    
    return await prisma.$transaction(async (tx) => {
        const existingCart = await tx.cart.findUnique({
            where: { userId },
        });

        if (!existingCart) {
            throw new ApiError(404, "Cart not found.");
        }

        await tx.cartItem.deleteMany({
            where: { cartId: existingCart.id },
        });

        return null;
    });
}