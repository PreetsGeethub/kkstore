import prisma from "../config/prisma.js";
import ApiError from "../utils/ApiError.js";

export const createAddress = async (userId, addressData) => {
    return await prisma.$transaction(async (tx) => {

        if (addressData.isDefault) {
            await tx.address.updateMany({
                where: {
                    userId,
                    isDefault: true,
                },
                data: {
                    isDefault: false,
                },
            });
        }

        const address = await tx.address.create({
            data: {
                userId,
                ...addressData,
            },
        });

        return address;
    });
};

export const getAddresses = async (userId) => {
    const addresses = await prisma.address.findMany({
        where: {
            userId,
        },
        orderBy: [
            { isDefault: "desc" },
            { createdAt: "desc" },
        ],
        select: {
            id: true,
            fullName: true,
            phone: true,
            addressLine1: true,
            addressLine2: true,
            city: true,
            state: true,
            postalCode: true,
            country: true,
            isDefault: true,
        },
    });

    return addresses;
};

export const getAddressById = async (userId, addressId) => {
    const address = await prisma.address.findFirst({
        where: {
            id: addressId,
            userId,
        },
    });

    if (!address) {
        throw new ApiError(
            404,
            "Address not found."
        );
    }

    return address;
};


export const updateAddress = async (userId, addressId, addressData) => {
    return await prisma.$transaction(async (tx) => {
        
        const address = await tx.address.findFirst({
            where: {
                id: addressId,
                userId,
            },
        });

        if (!address) {
            throw new ApiError(
                404,
                "Address not found."
            );
        }

        if (addressData.isDefault === true) {
            // unset existing default address(es)
            await tx.address.updateMany({
                where: {
                    userId,
                    isDefault: true,
                    id: {
                        not: addressId,
                    },
                },
                data: {
                    isDefault: false,
                },
            });
        }

        const updatedAddress = await tx.address.update({
            where: {
                id: address.id,
            },
            data: {
                ...addressData,
            },
        });

        return updatedAddress;
    });
};


export const deleteAddress = async (userId, addressId) => {
    const address = await prisma.address.findFirst({
        where:{
            id: addressId,
            userId,
        }
    })
    if(!address){
        throw new ApiError(404,"Address not found");
    }
    const deleteAdd = await prisma.address.delete({
        where:{
            id: addressId
        }
    })
    return deleteAdd;
};