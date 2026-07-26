import prisma from "../config/prisma.js";
import ApiError from "../utils/ApiError.js";
import bcrypt from "bcrypt";
import { env } from "../config/env.js";
import {
    generateAccessToken,
    generateRefreshToken,
  } from "../utils/token.js";
import { da } from "zod/v4/locales";

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
