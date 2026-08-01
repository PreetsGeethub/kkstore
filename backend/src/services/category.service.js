import { date, includes } from "zod";
import prisma from "../config/prisma.js";
import ApiError from "../utils/ApiError.js";
import { generateSlug } from "../utils/generateSlug.js";

export const createCategory = async (categoryData) => {
    const { name, image } = categoryData;
    const slug = generateSlug(name);

    const existingCategory = await prisma.category.findUnique({
        where: { slug }
    })

    if (existingCategory) {
        throw new ApiError(
            409,
            "Category with this name already exists."
        )
    }

    const category = await prisma.category.create({
        data: {
            name,
            image,
            slug
        }
    })

    return category;
}
export const getCategories = async (data) => {
    const { search, status, sortBy, order, page, limit } = data;

    let where = {};
    if (search) {
        where.name = {
            contains: search,
            mode: "insensitive"
        };
    }

    if (status !== "all") {
        where.status = status === "active";
    }

    let orderBy = {};
    orderBy[sortBy] = order;

    const skip = (page - 1) * limit;
    const take = limit;

    // const categories = await prisma.category.findMany({
    //     where,
    //     orderBy,
    //     skip,
    //     take,
    //     include: {
    //         _count: {
    //             select: {
    //                 products: true
    //             }
    //         }
    //     }
    // })

    // const totalCategories = await prisma.category.count({
    //     where,
    // })
  
    const [categories, totalCategories] = await Promise.all([
        prisma.category.findMany({
            where,
            orderBy,
            skip,
            take,
            include: {
                _count: {
                    select: {
                        products: true,
                    },
                },
            },
        }),
        prisma.category.count({
            where,
        }),
    ]);
    const totalPages = Math.ceil(totalCategories / limit);

    return {
        categories,
        pagination: {
            total: totalCategories,
            page,
            limit,
            totalPages,
            hasNextPage: page < totalPages,
            hasPreviousPage: page > 1,
        }
    }

}

export const getCategoryById = async (id) => {
    const category = await prisma.category.findUnique({
        where: { id },
    });

    if (!category) {
        throw new ApiError(
            404,
            "Category not found."
        );
    }

    return category;
};

export const updateCategory = async (data, id) => {
    const existingCategory = await prisma.category.findUnique({
        where: { id },
    });

    if (!existingCategory) {
        throw new ApiError(404, "Category does not exist");
    }

    const updateObj = { ...data };

    if (data.name && existingCategory.name !== data.name) {
        const slug = generateSlug(data.name);

        const anotherCategory = await prisma.category.findUnique({
            where: { slug },
        });

        if (anotherCategory && anotherCategory.id !== id) {
            throw new ApiError(
                409,
                "A category with this name already exists"
            );
        }

        updateObj.slug = slug;
    }

    return await prisma.category.update({
        where: { id },
        data: updateObj,
    });
};

export const deleteCategory = async (id) => {
    const existingCategory = await prisma.category.findUnique({
        where:{id},
        include:{
            _count :{
                select :{
                    products : true,
                }
            }
        }
    })
    if(!existingCategory){
        throw new ApiError(
            404, // resources not  found
            "Category does not exist"
        )
    }

    if(!existingCategory.status){
        throw new ApiError(
            409,
            "Category is already inactive"
        )
    }
    if(existingCategory._count.products >  0){
        throw new ApiError(
            409,
            "Cannot delete a category that contains a product"
        )
    }

    const deleteCategory = await prisma.category.update({
        where:{id},
        data:{
            status: false,
        }
    })

    return deleteCategory
}