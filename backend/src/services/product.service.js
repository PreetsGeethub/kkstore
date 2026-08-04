import prisma from "../config/prisma.js";
import ApiError from "../utils/ApiError.js";
import { generateSlug } from "../utils/generateSlug.js";

export const createProduct = async (productData) => {
    const { images, variants, ...productDetails } = productData;

    const slug = generateSlug(productDetails.name);

    const existingProduct = await prisma.product.findUnique({
        where: { slug },
    });

    if (existingProduct) {
        throw new ApiError(
            409,
            "Product with this name already exists."
        );
    }

    const product = await prisma.product.create({
        data: {
            ...productDetails,
            slug,

            images: {
                create: images,
            },

            variants: {
                create: variants,
            },
        },

        include: {
            images: true,
            variants: true,
        },
    });

    return product;
};

export const getProducts = async (data) => {
    const {
        page,
        limit,
        search,
        status,
        categoryId,
        availability,
        minPrice,
        maxPrice,
        color,
        sortBy,
        order,
    } = data;

    let where = {};

    // Search
    if (search) {
        where.OR = [
            {
                name: {
                    contains: search,
                    mode: "insensitive",
                },
            },
            {
                description: {
                    contains: search,
                    mode: "insensitive",
                },
            },
            {
                category: {
                    name: {
                        contains: search,
                        mode: "insensitive",
                    },
                },
            },
        ];
    }

    // Status
    if (status !== "all") {
        where.status = status === "active";
    }

    // Category
    if (categoryId) {
        where.categoryId = categoryId;
    }

    // Variant Filters
    let variantFilter = {};

    if (availability === "inStock") {
        variantFilter.stock = {
            gt: 0,
        };
    }

    if (color) {
        variantFilter.color = {
            contains: color,
            mode: "insensitive",
        };
    }

    if (minPrice || maxPrice) {
        variantFilter.price = {};

        if (minPrice) {
            variantFilter.price.gte = minPrice;
        }

        if (maxPrice) {
            variantFilter.price.lte = maxPrice;
        }
    }

    if (Object.keys(variantFilter).length > 0) {
        where.variants = {
            some: variantFilter,
        };
    }

    if (availability === "outOfStock") {
        where.variants = {
            none: {
                stock: {
                    gt: 0,
                },
            },
        };
    }

    // Sorting
    let orderBy = {};

    if (sortBy !== "price") {
        orderBy[sortBy] = order;
    }

    const skip = (page - 1) * limit;
    const take = limit;

    const [products, totalProducts] = await Promise.all([
        prisma.product.findMany({
            where,
            orderBy,
            skip,
            take,
            select: {
                id: true,
                name: true,
                slug: true,
                status: true,
            
                category: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            
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
        }),

        prisma.product.count({
            where,
        }),
    ]);

    const formattedProducts = products.map((product) => {
        const startingPrice = Math.min(
            ...product.variants.map((variant) => variant.price)
        );

        const totalStock = product.variants.reduce(
            (sum, variant) => sum + variant.stock,
            0
        );

        return {
            ...product,
            thumbnail: product.images[0]?.imageUrl ?? null,
            startingPrice,
            totalStock,
        };
    });

    const totalPages = Math.ceil(totalProducts / limit);

    return {
        products: formattedProducts,
        pagination: {
            total: totalProducts,
            page,
            limit,
            totalPages,
            hasNextPage: page < totalPages,
            hasPreviousPage: page > 1,
        },
    };
};