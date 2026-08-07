import {z} from "zod";

export const createWishlistSchema = z.object({
    productId: z.string().cuid("Please provide a valid product ID."),
});

export const deleteWishlistSchema = z.object({
    productId: z.string().cuid("Please provide a valid product ID."),
});