import {z} from "zod";

export const createCategorySchema = z.object({
    name: z.string().trim().min(2,"Minimum two letters are required").max(65,"No more than 65 chars are allowed"),
    image: z.string().trim().url().optional()
})

export const updateCategorySchema = createCategorySchema.partial();