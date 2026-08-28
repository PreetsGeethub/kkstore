import jwt from "jsonwebtoken";
import prisma from "../config/prisma.js";
import ApiError from "../utils/ApiError.js";
import { env } from "../config/env.js";
import asyncHandler from "../utils/asyncHandler.js";

const optionalProtect = asyncHandler(async (req, res, next) => {
    const token = req.cookies?.accessToken;

    // No token → continue as guest
    if (!token) {
        return next();
    }

    let decoded;

    try {
        decoded = jwt.verify(
            token,
            env.JWT_ACCESS_SECRET
        );
    } catch (error) {
        throw new ApiError(
            401,
            "Invalid or expired access token."
        );
    }

    const user = await prisma.user.findUnique({
        where: {
            id: decoded.userId,
        },
        select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            role: true,
        },
    });

    if (!user) {
        throw new ApiError(
            401,
            "User does not exist."
        );
    }

    req.user = user;

    return next();
});

export default optionalProtect;