import { Prisma, OrderStatus } from "@prisma/client";
import prisma from "../config/prisma.js";
import ApiError from "../utils/ApiError.js";
import { includes } from "zod";
import { ca } from "zod/v4/locales";
import { validateCoupon } from "./coupon.service.js";
export const createOrder = async ({
    userId,
    guestToken,
    guestEmail,
    addressId,
    shipping,
    couponCode,
}) => {
    return await prisma.$transaction(async (tx) => {

        let cart;
        let cartItems;
        let cartId;
        let guestCartId;

        // 1. Resolve Cart / GuestCart
        if (userId) {
            cart = await tx.cart.findUnique({
                where: {
                    userId,
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

            if (!cart) {
                throw new ApiError(
                    400,
                    "Cart is empty."
                );
            }

            cartItems = cart.cartItems;
            cartId = cart.id;

        } else {
            cart = await tx.guestCart.findUnique({
                where: {
                    guestToken,
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

            if (!cart) {
                throw new ApiError(
                    400,
                    "Cart is empty."
                );
            }

            cartItems = cart.cartItems;
            guestCartId = cart.id;
        }

        // 2. Cart must contain items
        if (cartItems.length === 0) {
            throw new ApiError(
                400,
                "Cart is empty."
            );
        }

        // 3. Validate cart items
        for (const item of cartItems) {
            const variant = item.variant;
            const product = variant.product;

            if (!variant.status) {
                throw new ApiError(
                    400,
                    `${product.name} variant is unavailable.`
                );
            }

            if (!product.status) {
                throw new ApiError(
                    400,
                    `${product.name} is unavailable.`
                );
            }

            if (item.quantity > variant.stock) {
                throw new ApiError(
                    400,
                    `${product.name} has only ${variant.stock} items left in stock.`
                );
            }
        }

        // 4. Calculate subtotal
        const subtotal = cartItems.reduce(
            (acc, item) =>
                acc.plus(
                    item.variant.price.mul(item.quantity)
                ),
            new Prisma.Decimal(0)
        );

        // 5. Validate coupon and calculate discount
        let discountAmount = new Prisma.Decimal(0);
        let appliedCoupon = null;

        if (couponCode) {
            if (!userId) {
                throw new ApiError(
                    401,
                    "Sign up to apply this coupon."
                );
            }

            const couponResult = await validateCoupon(
                couponCode,
                subtotal,
                userId
            );

            appliedCoupon = couponResult.coupon;
            discountAmount = couponResult.discountAmount;
        }

        // 6. Calculate shipping
        const shippingCost = subtotal.greaterThanOrEqualTo(999)
            ? new Prisma.Decimal(0)
            : new Prisma.Decimal(50);

        // 7. Calculate final total
        const totalAmount = subtotal
            .minus(discountAmount)
            .plus(shippingCost);

        // 8. Resolve shipping snapshot
        let shippingSnapshot;

        if (userId) {

            // Logged-in user using saved address
            if (addressId) {
                const address = await tx.address.findFirst({
                    where: {
                        id: addressId,
                        userId,
                    },
                });

                if (!address) {
                    throw new ApiError(
                        404,
                        "Address not found."
                    );
                }

                shippingSnapshot = {
                    shippingFullName: address.fullName,
                    shippingPhone: address.phone,
                    shippingAddressLine1: address.addressLine1,
                    shippingAddressLine2: address.addressLine2,
                    shippingCity: address.city,
                    shippingState: address.state,
                    shippingPostalCode: address.postalCode,
                    shippingCountry: address.country,
                };

            } else {

                // Logged-in user entering a new address
                if (!shipping) {
                    throw new ApiError(
                        400,
                        "Shipping details are required."
                    );
                }

                shippingSnapshot = {
                    shippingFullName: shipping.shippingFullName,
                    shippingPhone: shipping.shippingPhone,
                    shippingAddressLine1: shipping.shippingAddressLine1,
                    shippingAddressLine2: shipping.shippingAddressLine2,
                    shippingCity: shipping.shippingCity,
                    shippingState: shipping.shippingState,
                    shippingPostalCode: shipping.shippingPostalCode,
                    shippingCountry: shipping.shippingCountry,
                };
            }

        } else {

            // Guest checkout
            if (!shipping || !guestEmail) {
                throw new ApiError(
                    400,
                    "Shipping details and guest email are required."
                );
            }

            shippingSnapshot = {
                shippingFullName: shipping.shippingFullName,
                shippingPhone: shipping.shippingPhone,
                shippingAddressLine1: shipping.shippingAddressLine1,
                shippingAddressLine2: shipping.shippingAddressLine2,
                shippingCity: shipping.shippingCity,
                shippingState: shipping.shippingState,
                shippingPostalCode: shipping.shippingPostalCode,
                shippingCountry: shipping.shippingCountry,
            };
        }

        // 9. Generate order number
        const orderNumber = `ORD-${Date.now()}-${Math.floor(
            Math.random() * 1000
        )}`;

        // 10. Create Order
        const order = await tx.order.create({
            data: {
                orderNumber,

                userId: userId || null,
                guestEmail: userId ? null : guestEmail,

                ...shippingSnapshot,

                subtotal,
                discountAmount,
                shippingCost,
                totalAmount,

                status: OrderStatus.PENDING_PAYMENT,

                ...(appliedCoupon
                    ? {
                        couponUsages: {
                            create: {
                                couponId: appliedCoupon.id,
                                userId,
                            },
                        },
                    }
                    : {}),
            },
        });

        // 11. Increment coupon usage
        if (appliedCoupon) {
            await tx.coupon.update({
                where: {
                    id: appliedCoupon.id,
                },
                data: {
                    usedCount: {
                        increment: 1,
                    },
                },
            });
        }

        // 12. Create OrderItems + reduce stock
        for (const item of cartItems) {
            await tx.orderItem.create({
                data: {
                    orderId: order.id,
                    variantId: item.variantId,

                    productName: item.variant.product.name,
                    sku: item.variant.sku,
                    color: item.variant.color,
                    size: item.variant.size,

                    priceAtPurchase: item.variant.price,
                    quantity: item.quantity,
                    lineTotal: item.variant.price.mul(
                        item.quantity
                    ),
                },
            });

            await tx.variant.update({
                where: {
                    id: item.variantId,
                },
                data: {
                    stock: {
                        decrement: item.quantity,
                    },
                },
            });
        }

        // 13. Clear source cart
        if (userId) {
            await tx.cartItem.deleteMany({
                where: {
                    cartId,
                },
            });
        } else {
            await tx.guestCartItem.deleteMany({
                where: {
                    guestCartId,
                },
            });
        }

        // 14. Return complete order
        return await tx.order.findUnique({
            where: {
                id: order.id,
            },
            include: {
                orderItems: {
                    include: {
                        variant: {
                            select: {
                                id: true,
                                sku: true,
                                color: true,
                                size: true,
                                product: {
                                    select: {
                                        id: true,
                                        name: true,
                                        slug: true,
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
                user: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                    },
                },
                couponUsages: {
                    include: {
                        coupon: {
                            select: {
                                id: true,
                                code: true,
                                discountType: true,
                                discountValue: true,
                            },
                        },
                    },
                },
            },
        });
    });
};
export const getOrders = async (userId) => {
    const orders = await prisma.order.findMany({
        where: { userId },

        select: {
            id: true,
            orderNumber: true,
            status: true,

            subtotal: true,
            discountAmount: true,
            shippingCost: true,
            totalAmount: true,

            createdAt: true,

            orderItems: {
                select: {
                    quantity: true,
                    color: true,
                    size: true,

                    productName: true,
                    priceAtPurchase: true,
                    lineTotal: true,
                    variant: {
                        select: {
                            id: true,
                            sku: true,
                            color: true,
                            size: true,
                            product: {
                                select: {
                                    id: true,
                                    name: true,
                                    slug: true,
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
    })
    return orders

}


export const getOrderById = async (orderId, userId) => {
    const order = await prisma.order.findFirst({
        where: {
            id: orderId,
            userId: userId,
        },
        select: {

            id: true,
            orderNumber: true,
            status: true,

            subtotal: true,
            discountAmount: true,
            shippingCost: true,
            totalAmount: true,

            createdAt: true,
            shippingFullName: true,
            shippingPhone: true,

            shippingAddressLine1: true,
            shippingAddressLine2: true,

            shippingCity: true,
            shippingState: true,
            shippingPostalCode: true,
            shippingCountry: true,



            orderItems: {
                select: {
                    quantity: true,
                    color: true,
                    size: true,

                    productName: true,
                    priceAtPurchase: true,
                    lineTotal: true,
                    variant: {
                        select: {
                            id: true,
                            sku: true,
                            product: {
                                select: {
                                    id: true,
                                    slug: true,
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
        }
    });
    if (!order) {
        throw new ApiError(404, "Order not found.");
    }

    return order;
}


export const cancelOrder = async (orderId, userId) => {

    return await prisma.$transaction(async (tx) => {
        const order = await tx.order.findFirst({
            where: {
                id: orderId,
                userId: userId,
                status: OrderStatus.CONFIRMED,
            },
            include: {
                orderItems: true,
            }
        });
        if (!order) {
            throw new ApiError(400, "Order cannot be cancelled.");
        }

        for (const item of order.orderItems) {
            await tx.variant.update({
                where: {
                    id: item.variantId,
                },
                data: {
                    stock: {
                        increment: item.quantity,
                    },
                },
            });
        }

        const updatedOrder = await tx.order.update({
            where: {
                id: orderId,
            },
            data: {
                status: OrderStatus.CANCELLED,
            },
        });

        return updatedOrder;
    });
}


export const getAllOrders = async (data) => {
    const {
        search,
        status,
        sortBy,
        order,
        page,
        limit,
    } = data;

    const where = {};

    // Search by order number
    if (search) {
        where.orderNumber = {
            contains: search,
            mode: "insensitive",
        };
    }

    // Filter by status
    if (status !== "all") {
        where.status = status;
    }

    // Sorting
    const orderBy = {
        [sortBy]: order,
    };

    const skip = (page - 1) * limit;
    const take = limit;

    const [orders, totalOrders] = await Promise.all([
        prisma.order.findMany({
            where,
            orderBy,
            skip,
            take,
            include: {
                user: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                    },
                },
                orderItems: {
                    select: {
                        productName: true,
                        sku: true,
                        quantity: true,
                        priceAtPurchase: true,
                        lineTotal: true,
                    },
                },
            },
        }),

        prisma.order.count({
            where,
        }),
    ]);

    const totalPages = Math.ceil(
        totalOrders / limit
    );

    return {
        orders,
        pagination: {
            total: totalOrders,
            page,
            limit,
            totalPages,
            hasNextPage: page < totalPages,
            hasPreviousPage: page > 1,
        },
    };
};


export const getAdminOrderById = async (orderId) => {
    const order = await prisma.order.findUnique({
        where: {
            id: orderId,
        },
        include: {
            user: {
                select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    email: true,
                    phone: true,
                },
            },

            orderItems: {
                include: {
                    variant: {
                        select: {
                            id: true,
                            sku: true,
                            color: true,
                            size: true,
                            price: true,

                            product: {
                                select: {
                                    id: true,
                                    name: true,
                                    slug: true,

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

            payment: {
                select: {
                    id: true,
                    paymentMethod: true,
                    paymentStatus: true,
                    amount: true,
                    transactionId: true,
                    gateway: true,
                    gatewayOrderId: true,
                    paidAt: true,
                    createdAt: true,
                },
            },

            couponUsages: {
                include: {
                    coupon: {
                        select: {
                            id: true,
                            code: true,
                            discountType: true,
                            discountValue: true,
                        },
                    },
                },
            },
        },
    });

    if (!order) {
        throw new ApiError(
            404,
            "Order not found."
        );
    }

    return order;
};


export const updateOrderStatus = async (orderId, status) => {
    const order = await prisma.order.findUnique({
        where: {
            id: orderId,
        },
        select: {
            id: true,
            orderNumber: true,
            status: true,
        },
    });

    if (!order) {
        throw new ApiError(
            404,
            "Order not found."
        );
    }

    if (order.status === status) {
        throw new ApiError(
            409,
            `Order is already ${status}.`
        );
    }

    const updatedOrder = await prisma.order.update({
        where: {
            id: orderId,
        },
        data: {
            status,
        },
    });

    return updatedOrder;
};

