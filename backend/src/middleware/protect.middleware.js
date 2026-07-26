import jwt from "jsonwebtoken";
import prisma from "../config/prisma.js";
import { env } from "../config/env.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";

const protect = asyncHandler(async (req, res, next) => {
    const token = req.cookies.accessToken;

    if (!token) {
        throw new ApiError(
            401,
            "Access token is missing."
        );
    }

    let decoded;
    try {
         decoded= jwt.verify(token,env.JWT_ACCESS_SECRET);
    } catch (error) {
        throw new ApiError(
            401,
            "Invalid or expired access token"
        )
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

    if(!user){
        throw new ApiError(
            401,
            "Authentication Failed."
        )
    }
    req.user  = user;
    next();


});

export default protect;