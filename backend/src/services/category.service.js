import prisma from "../config/prisma.js";
import ApiError from "../utils/ApiError.js";
import { generateSlug } from "../utils/generateSlug.js";

export const createCategory = async (categoryData) => {
    const {name, image } = categoryData;
    const slug = generateSlug(name);

    const existingCategory = await prisma.category.findUnique({
        where:{slug}
    })

    if(existingCategory) {
        throw new ApiError(
            409,
            "Category with this name already exists."
        )
    }

    const category = await prisma.category.create({
        data : {
            name,
            image,
            slug
        }
    })

    return category;
}