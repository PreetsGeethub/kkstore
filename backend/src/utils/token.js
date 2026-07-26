import jwt from "jsonwebtoken";
import { env } from "../config/env.js";


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