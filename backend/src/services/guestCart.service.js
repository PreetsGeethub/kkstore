import prisma from "../config/prisma.js";
import ApiError from "../utils/ApiError.js";
import crypto from 'crypto';

export const getOrCreateGuestCart = async (guestToken) => {
    let cart;

    if (guestToken) {
        cart = await prisma.guestCart.findUnique({
            where: {
                guestToken,
            },
        });
    }

    if (cart) {
        return {
            cart,
            guestToken: cart.guestToken,
        };
    }

    const newGuestToken = crypto.randomUUID();

    cart = await prisma.guestCart.create({
        data: {
            guestToken: newGuestToken,
        },
    });

    return {
        cart,
        guestToken: newGuestToken,
    };
};


export const addGuestCartItem = async (guestToken, variantId, quantity) => {

    const { cart,guestToken: resolvedGuestToken} = await getOrCreateGuestCart(guestToken);

    const variant = await prisma.variant.findUnique({
        where: {
            id: variantId,
        },
        select: {
            id: true,
            stock: true,
            status: true,
            product: {
                select: {
                    id: true,
                    name: true,
                    status: true,
                },
            },
        },
    });

    if (
        !variant ||
        !variant.status ||
        !variant.product.status ||
        variant.stock <= 0
    ) {
        throw new ApiError(
            404,
            "This variant is no longer available."
        );
    }

    if (quantity > variant.stock) {
        throw new ApiError(
            400,
            "Selected quantity is not available. Try a smaller quantity."
        );
    }

    const existingItem = await prisma.guestCartItem.findUnique({
        where: {
            guestCartId_variantId: {
                guestCartId: cart.id,
                variantId,
            },
        },
    });

    if (existingItem) {

        const newQuantity = existingItem.quantity + quantity;

        if (newQuantity > variant.stock) {
            throw new ApiError(
                400,
                "Selected quantity exceeds available stock."
            );
        }

        const updatedItem = await prisma.guestCartItem.update({
            where: {
                id: existingItem.id,
            },
            data: {
                quantity: newQuantity,
            },
        });

        return {
            item: updatedItem,
            guestToken: resolvedGuestToken,
        };
    }

    const newItem = await prisma.guestCartItem.create({
        data: {
            guestCartId: cart.id,
            variantId,
            quantity,
        },
    });

    return {
        item: newItem,
        guestToken: resolvedGuestToken,
    };
};


export const getGuestCart = async (guestToken) => {

    const {
        cart,
        guestToken: resolvedGuestToken,
    } = await getOrCreateGuestCart(guestToken);

    // now fetch the cart with its items
    //GuestCart → GuestCartItem → Variant → Product
    const fullCart = await prisma.guestCart.findUnique({
        where: {
            id: cart.id,
        },
        select: {
            id: true,
            guestToken: true,
            cartItems: {
                select: {
                    id: true,
                    quantity: true,
                    variant: {
                        select: {
                            id: true,
                            sku: true,
                            color: true,
                            size: true,
                            price: true,
                            stock: true,
                            status: true,
                            product: {
                                select: {
                                    id: true,
                                    name: true,
                                    slug: true,
                                    status: true,
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
    return {
        cart: fullCart,
        guestToken: resolvedGuestToken,
    };

};


export const updateGuestCartItem = async (
    guestToken,
    itemId,
    quantity
) => {
    const {
        cart,
        guestToken: resolvedGuestToken,
    } = await getOrCreateGuestCart(guestToken);

    const cartItem = await prisma.guestCartItem.findFirst({
        where: {
            guestCartId: cart.id,
            id: itemId,
        },
        select: {
            id: true,
            quantity: true,
            variant: {
                select: {
                    stock: true,
                    status: true,
                    product: {
                        select: {
                            status: true,
                        },
                    },
                },
            },
        },
    });

    if (!cartItem) {
        throw new ApiError(
            404,
            "Cart item not found."
        );
    }

    if (
        quantity > cartItem.variant.stock ||
        !cartItem.variant.status ||
        !cartItem.variant.product.status
    ) {
        throw new ApiError(
            400,
            "Selected quantity is not available."
        );
    }

    const updatedItem = await prisma.guestCartItem.update({
        where: {
            id: cartItem.id,
        },
        data: {
            quantity,
        },
    });

    return {
        item: updatedItem,
        guestToken: resolvedGuestToken,
    };
};


export const removeGuestCartItem = async (guestToken, itemId) => {
    // your code
    const {cart,guestToken: newGuestToken}  = await getOrCreateGuestCart(guestToken);

    const cartItem = await prisma.guestCartItem.findFirst({
        where: {
            guestCartId: cart.id,
            id: itemId,
        }
    })

    if(!cartItem){
        throw new ApiError(404,"This Item does not exist in cart")
    }

    const deletedItem = await prisma.guestCartItem.delete({
        where:{
            id: cartItem.id,
        }
    })
    return {
        item: deletedItem,
        guestToken: newGuestToken,
    };

};

export const clearGuestCart = async (guestToken) => {
    const {
        cart,
        guestToken: resolvedGuestToken,
    } = await getOrCreateGuestCart(guestToken);

    const result = await prisma.guestCartItem.deleteMany({
        where: {
            guestCartId: cart.id,
        },
    });

    return {
        deletedCount: result.count,
        guestToken: resolvedGuestToken,
    };
};