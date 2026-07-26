
import { env } from "../config/env.js";
export const baseCookieOptions = {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "strict",
};

export const accessTokenOptions = {
    ...baseCookieOptions,
    maxAge: 15 * 60 * 1000,
};

export const refreshTokenOptions = {
    ...baseCookieOptions,
    maxAge: 30 * 24 * 60 * 60 * 1000,
};