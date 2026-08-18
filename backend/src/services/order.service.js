import { Prisma, OrderStatus } from "@prisma/client";
import prisma from "../config/prisma.js";
import ApiError from "../utils/ApiError.js";
import { includes } from "zod";

export const createOrder = async (orderData, userId) => {
    return await prisma.$transaction(async (tx) => {

        // Fetch user's cart
        const cart = await tx.cart.findUnique({
            where: { userId },
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

        if (!cart || cart.cartItems.length === 0) {
            throw new ApiError(400, "Cart is empty.");
        }

        // Validate all cart items
        for (const item of cart.cartItems) {
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

        // Calculate totals
        const subtotal = cart.cartItems.reduce(
            (acc, item) =>
                acc.plus(item.variant.price.mul(item.quantity)),
            new Prisma.Decimal(0)
        );

        const discountAmount = new Prisma.Decimal(0);

        const shippingCost = subtotal.greaterThanOrEqualTo(999)
            ? new Prisma.Decimal(0)
            : new Prisma.Decimal(50);

        const totalAmount = subtotal
            .minus(discountAmount)
            .plus(shippingCost);

        // Generate Order Number
        const orderNumber = `ORD-${Date.now()}-${Math.floor(
            Math.random() * 1000
        )}`;

        // Create Order
        const order = await tx.order.create({
            data: {
                orderNumber,
                userId,

                subtotal,
                discountAmount,
                shippingCost,
                totalAmount,

                ...orderData,

                status: OrderStatus.PENDING_PAYMENT,
            },
        });

        // Create Order Items & Reduce Stock
        for (const item of cart.cartItems) {
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
                    lineTotal: item.variant.price.mul(item.quantity),
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

        // Clear Cart (keep Cart record)
        await tx.cartItem.deleteMany({
            where: {
                cartId: cart.id,
            },
        });

        // Return Complete Order
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
    const order  = await prisma.order.findFirst({
                    where : {
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
            include : {
                orderItems: true,
            }
        });
        if(!order) {
            throw new ApiError(400, "Order cannot be cancelled.");
        }

        for(const item of order.orderItems) {
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

