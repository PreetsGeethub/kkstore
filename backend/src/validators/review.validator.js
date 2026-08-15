import { z } from "zod";

export const createReviewSchema = z.object({
    productId: z.string().cuid("Invalid product ID."),

    rating: z
        .number()
        .int()
        .min(1, "Rating must be at least 1.")
        .max(5, "Rating cannot exceed 5."),

    title: z
        .string()
        .trim()
        .max(100, "Title cannot exceed 100 characters.")
        .optional(),

    comment: z
        .string()
        .trim()
        .min(1, "Comment is required.")
        .max(1000, "Comment cannot exceed 1000 characters."),
});


export const getProductReviewsSchema = z.object({
    productId: z.string().cuid("Invalid product ID."),
});

export const updateReviewParamsSchema = z.object({
    reviewId: z.string().cuid("Invalid review ID."),
});

export const updateReviewSchema = z.object({
    rating: z
        .number()
        .int()
        .min(1, "Rating must be at least 1.")
        .max(5, "Rating cannot exceed 5.")
        .optional(),

    title: z
        .string()
        .trim()
        .max(100, "Title cannot exceed 100 characters.")
        .optional(),

    comment: z
        .string()
        .trim()
        .min(1, "Comment is required.")
        .max(1000, "Comment cannot exceed 1000 characters.")
        .optional(),
});

export const deleteReviewSchema = z.object({
    reviewId: z.string().cuid("Invalid review ID."),
});