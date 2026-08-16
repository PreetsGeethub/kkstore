import prisma from "../config/prisma.js";
import ApiError from "../utils/ApiError.js";
import bcrypt from "bcrypt";
import { env } from "../config/env.js";
import {
    generateAccessToken,
    generateRefreshToken,
  } from "../utils/token.js";
import { da } from "zod/v4/locales";
import jwt from "jsonwebtoken";

// const existingUser = await prisma.user.findUnique({
//     where: {
//         email : userDate.email
//     }
// })

// if(existingUser){
//     new ApiError(409, "Email is already registered.");
// } // it only checks for email, not username. So we need to check for username as well.and it also dont support OR or multiple conditions. So we need to use findFirst instead of findUnique.


export const registerUser = async (userData) => {
    const { firstName, lastName, email, phone, password } = userData;
    const existingUser = await prisma.user.findFirst({
        where: {
            OR: [
                { email },
                { phone }
            ]
        }
    });

    if (existingUser?.email === userData.email) {
        throw new ApiError(409, "Email  is already registered.");
    }

    if (existingUser?.phone === userData.phone) {
        throw new ApiError(409, "phone number is already registered.");
    }
    const hashedPassword = await bcrypt.hash(
        password,
        env.BCRYPT_SALT_ROUNDS
    );

    const user = await prisma.user.create({
        data: {
            firstName,
            lastName,
            email,
            phone,
            password: hashedPassword
        },
        select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            role: true,
            isVerified: true,
            isActive: true,
            createdAt: true,
            updatedAt: true,
        }
    })

    return user;
};


export const loginUser = async (data) =>{
    const {identifier, password} = data;

    const user = await prisma.user.findFirst({
        where: {
            OR: [
                { email: identifier },
                { phone: identifier }
            ]
        }
    });

    if(!user) {
        throw new ApiError(401, "Invalid email/phone or password.");
    }
    const isPasswordValid  = await bcrypt.compare(password, user.password);
    if(!isPasswordValid ) {
        throw new ApiError(401, "Invalid email/phone or password.");
    }

    
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    await prisma.user.update({
        where: {
            id: user.id
        },
        data: {
            refreshToken
        }
    })

    const safeUser = {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        role: user.role,
    };
    return {
        user: safeUser,
        accessToken,
        refreshToken,
    };

}


export const loginWithGoogle = async (profile) => {
    const googleId = profile.id;
    const email = profile.emails?.[0]?.value;

    if (!email) {
        throw new ApiError(
            400,
            "Google account email could not be retrieved."
        );
    }

    // 1. Find by Google ID
    let user = await prisma.user.findUnique({
        where: {
            googleId,
        },
    });

    if (user) {
        return user;
    }

    // 2. Find existing account by email
    user = await prisma.user.findUnique({
        where: {
            email,
        },
    });

    // 3. Existing account → link Google account
    if (user) {
        user = await prisma.user.update({
            where: {
                id: user.id,
            },
            data: {
                googleId,
            },
        });

        return user;
    }

    // 4. Completely new Google user
    const firstName =
        profile.name?.givenName ||
        profile.displayName?.split(" ")[0] ||
        "";

    const lastName =
        profile.name?.familyName ||
        profile.displayName?.split(" ").slice(1).join(" ") ||
        "";

    user = await prisma.user.create({
        data: {
            firstName,
            lastName,
            email,
            googleId,
            password: null,
            phone: null,
        },
    });

    return user;
};

export const completeGoogleProfile = async (userId, phone) => {
    const existingUser = await prisma.user.findUnique({
        where: {
            phone,
        },
        select: {
            id: true,
        },
    });

    if (existingUser && existingUser.id !== userId) {
        throw new ApiError(
            409,
            "Phone number is already registered."
        );
    }

    const user = await prisma.user.update({
        where: {
            id: userId,
        },
        data: {
            phone,
        },
        select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            role: true,
            isVerified: true,
            isActive: true,
        },
    });

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    await prisma.user.update({
        where: {
            id: user.id,
        },
        data: {
            refreshToken,
        },
    });

    return {
        user,
        accessToken,
        refreshToken,
    };
};

export const logoutUser = async (id) =>{
    await prisma.user.update({
        where : {
            id,
        },
        data:{
            refreshToken : null,
        }
    })

    // if(!user){
    //     throw new ApiError(
    //         401,
    //         "User Doesnt Exist"
    //     )
    // } // update autmatially throws error if it doesnt exist

}

export const refreshUserToken = async (refreshToken) => {
    // 1. Check if refresh token exists
    if (!refreshToken) {
        throw new ApiError(
            401,
            "Refresh token is missing."
        );
    }

    // 2. Verify refresh token
    let decoded;

    try {
        decoded = jwt.verify(
            refreshToken,
            env.JWT_REFRESH_SECRET
        );
    } catch (error) {
        throw new ApiError(
            401,
            "Invalid or expired refresh token."
        );
    }

    // 3. Find user
    const dbUser = await prisma.user.findUnique({
        where: {
            id: decoded.userId,
        },
        select: {
            id: true,
            role: true,
            refreshToken: true,
        },
    });

    if (!dbUser) {
        throw new ApiError(
            401,
            "User does not exist."
        );
    }

    // 4. Compare refresh tokens
    if (refreshToken !== dbUser.refreshToken) {
        throw new ApiError(
            401,
            "Invalid refresh token."
        );
    }

    // 5. Generate new tokens
    const newAccessToken = generateAccessToken(dbUser);
    const newRefreshToken = generateRefreshToken(dbUser);

    // 6. Save new refresh token
    await prisma.user.update({
        where: {
            id: dbUser.id,
        },
        data: {
            refreshToken: newRefreshToken,
        },
    });

    // 7. Return tokens
    return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
    };
};