import { z } from "zod";

export const getAllReviewsSchema = z.object({
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

    search: z
        .string()
        .trim()
        .default(""),

    rating: z
        .enum(["1", "2", "3", "4", "5", "all"])
        .default("all"),
});

export const adminReviewIdSchema = z.object({
    reviewId: z.string().cuid("Invalid review ID."),
});

export const deleteAdminReviewSchema = z.object({
    reviewId: z.string().cuid("Invalid review ID."),
});