import prisma from "../config/prisma.js";
import ApiError from "../utils/ApiError.js";

const LOW_STOCK_THRESHOLD = 5;

export const getInventory = async ({
    page,
    limit,
    search,
    stockStatus,
    status,
}) => {
    const where = {};

    // Variant status
    if (status !== "all") {
        where.status = status === "active";
    }

    // Search by SKU, color, size, or product name
    if (search) {
        where.OR = [
            {
                sku: {
                    contains: search,
                    mode: "insensitive",
                },
            },
            {
                color: {
                    contains: search,
                    mode: "insensitive",
                },
            },
            {
                size: {
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

    // Stock status
    if (stockStatus === "inStock") {
        where.stock = {
            gt: 0,
        };
    }

    if (stockStatus === "lowStock") {
        where.stock = {
            gt: 0,
            lte: LOW_STOCK_THRESHOLD,
        };
    }

    if (stockStatus === "outOfStock") {
        where.stock = 0;
    }

    const skip = (page - 1) * limit;

    const [variants, totalVariants] = await Promise.all([
        prisma.variant.findMany({
            where,
            orderBy: {
                updatedAt: "desc",
            },
            skip,
            take: limit,

            select: {
                id: true,
                sku: true,
                color: true,
                size: true,
                price: true,
                comparePrice: true,
                stock: true,
                status: true,
                createdAt: true,
                updatedAt: true,

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
                    },
                },
            },
        }),

        prisma.variant.count({
            where,
        }),
    ]);

    const formattedVariants = variants.map((variant) => ({
        ...variant,
        thumbnail: variant.product.images[0]?.imageUrl ?? null,
        product: {
            id: variant.product.id,
            name: variant.product.name,
            slug: variant.product.slug,
            status: variant.product.status,
        },
    }));

    const totalPages = Math.ceil(
        totalVariants / limit
    );

    return {
        variants: formattedVariants,
        pagination: {
            total: totalVariants,
            page,
            limit,
            totalPages,
            hasNextPage: page < totalPages,
            hasPreviousPage: page > 1,
        },
    };
};


export const updateInventory = async (
    variantId,
    stock
) => {
    const variant = await prisma.variant.findUnique({
        where: {
            id: variantId,
        },
        select: {
            id: true,
            stock: true,
        },
    });

    if (!variant) {
        throw new ApiError(
            404,
            "Variant not found."
        );
    }

    const updatedVariant = await prisma.variant.update({
        where: {
            id: variantId,
        },
        data: {
            stock,
        },
        select: {
            id: true,
            sku: true,
            color: true,
            size: true,
            price: true,
            comparePrice: true,
            stock: true,
            status: true,
            updatedAt: true,

            product: {
                select: {
                    id: true,
                    name: true,
                    slug: true,
                },
            },
        },
    });

    return updatedVariant;
};