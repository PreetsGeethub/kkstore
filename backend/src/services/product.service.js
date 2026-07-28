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