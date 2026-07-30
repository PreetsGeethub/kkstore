import { z } from "zod";

export const createCategorySchema = z.object({
    name: z.string().trim().min(2, "Minimum two letters are required").max(65, "No more than 65 chars are allowed"),
    image: z.string().trim().url().optional()
})

export const updateCategorySchema = createCategorySchema.partial();

export const getCategoriesSchema = z.object({
    page: z.coerce.number()
        .int()
        .positive()
        .default(1),

    limit: z.coerce.number()
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
        "all"
    ]).default("active"),

    sortBy: z.enum([
        "name",
        "createdAt",
        "updatedAt"
    ]).default("createdAt"),

    order: z.enum([
        "asc",
        "desc"
    ]).default("desc"),



})

export const getCategoryByIdSchema = z.object({
    id: z.string().cuid(),
});

export const deleteCategorySchema = z.object({
    id: z.string().cuid(),
})
