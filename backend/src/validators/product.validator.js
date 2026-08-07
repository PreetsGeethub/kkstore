import { z } from "zod";
import { id } from "zod/v4/locales";

export const variantSchema = z
    .object({
        sku: z
            .string()
            .trim()
            .min(1, "SKU is required."),

        color: z
            .string()
            .trim()
            .min(1, "Color is required."),

        size: z
            .string()
            .trim()
            .min(1, "Size is required."),

        price: z
            .coerce

            .number()
            .positive("Price must be greater than 0."),

        comparePrice: z
            .number()
            .positive()
            .optional(),

        stock: z
            .number()
            .int()
            .min(0, "Stock cannot be negative."),
    })
    .refine(
        (data) =>
            data.comparePrice === undefined ||
            data.comparePrice >= data.price,
        {
            message:
                "Compare price must be greater than or equal to price.",
            path: ["comparePrice"],
        }
    );

export const imageSchema = z.object({
    imageUrl: z
        .string()
        .url("Image URL must be valid."),

    sortOrder: z
        .number()
        .int()
        .min(0)
        .optional(),
});

export const createProductSchema = z.object({
    name: z
        .string()
        .trim()
        .min(3, "Product name must be at least 3 characters.")
        .max(150, "Product name cannot exceed 150 characters."),

    description: z
        .string()
        .trim()
        .min(10, "Description must be at least 10 characters."),

    categoryId: z
        .string().cuid(),

    material: z
        .string()
        .trim()
        .min(2, "Material is required."),

    careInstructions: z
        .string()
        .trim()
        .min(2, "Care instructions are required."),

    gifUrl: z
        .string()
        .url("GIF URL must be valid.")
        .optional(),

    isAntiTarnish: z.boolean().optional(),

    isWaterproof: z.boolean().optional(),

    isSkinFriendly: z.boolean().optional(),

    isFeatured: z.boolean().optional(),

    isBestSeller: z.boolean().optional(),

    isNewArrival: z.boolean().optional(),

    images: z
        .array(imageSchema)
        .min(1, "At least one image is required."),

    variants: z
        .array(variantSchema)
        .min(1, "At least one variant is required."),
});

export const updateProductSchema =
    createProductSchema.partial();

export const getProductsSchema = z
    .object({
        page: z.coerce
            .number()
            .int()
            .positive()
            .default(1),

        limit: z.coerce
            .number()
            .int()
            .positive()
            .max(100)
            .default(10),

        search: z.string()
            .trim()
            .default(""),

        status: z.enum([
            "active",
            "inactive",
            "all",
        ]).default("active"),

        categoryId: z.string()
            .cuid()
            .optional(),

        availability: z.enum([
            "all",
            "inStock",
            "outOfStock",
        ]).default("all"),

        minPrice: z.coerce
            .number()
            .positive()
            .optional(),

        maxPrice: z.coerce
            .number()
            .positive()
            .optional(),

        color: z.string()
            .trim()
            .optional(),

        sortBy: z.enum([
            "name",
            "createdAt",
            "bestSelling",
        ]).default("createdAt"),

        order: z.enum([
            "asc",
            "desc",
        ]).default("desc"),
    })
    .refine(
        (data) =>
            data.minPrice === undefined ||
            data.maxPrice === undefined ||
            data.minPrice <= data.maxPrice,
        {
            message: "Minimum price cannot be greater than maximum price.",
            path: ["minPrice"],
        }
    );

export const getProductByIdSchema = z.object({
    id: z.string().cuid(),
});

export const deleteProductSchema = z.object({

    id: z.string().cuid(),
});