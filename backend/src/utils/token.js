import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import ApiError from "./ApiError.js";

export const generateAccessToken = (user) => {
    return jwt.sign(
        {
            userId: user.id,
            role: user.role,
        },
        env.JWT_ACCESS_SECRET,
        {
            expiresIn: env.JWT_ACCESS_EXPIRES_IN,
        }
    )
};

export const generateRefreshToken = (user) => {
    return jwt.sign(
        {
            userId: user.id,
        },
        env.JWT_REFRESH_SECRET,
        {
            expiresIn: env.JWT_REFRESH_EXPIRES_IN,
        }
    )
}


export const generateProfileCompletionToken = (user) => {
    return jwt.sign(
        {
            userId: user.id,
            purpose: "COMPLETE_GOOGLE_PROFILE",
        },
        env.JWT_PROFILE_COMPLETION_SECRET,
        {
            expiresIn: env.JWT_PROFILE_COMPLETION_EXPIRES_IN,
        }
    );
};

export const verifyProfileCompletionToken = (token) => {
    try {
        const decoded = jwt.verify(
            token,
            env.JWT_PROFILE_COMPLETION_SECRET
        );

        if (decoded.purpose !== "COMPLETE_GOOGLE_PROFILE") {
            throw new Error("Invalid token purpose.");
        }

        return decoded;
    } catch (error) {
        throw new ApiError(
            401,
            "Invalid or expired profile completion token."
        );
    }
};

