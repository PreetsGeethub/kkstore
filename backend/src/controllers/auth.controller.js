import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";
import { registerUser, loginUser, logoutUser, refreshUserToken ,completeGoogleProfile} from "../services/auth.service.js";
import {
    accessTokenOptions,
    refreshTokenOptions,
} from "../utils/cookieOptions.js";
import { generateProfileCompletionToken,verifyProfileCompletionToken } from "../utils/token.js";
export const register = asyncHandler(async (req, res) => {
    const userData = req.validated.body;

    const user = await registerUser(userData);

    return res.status(201).json(
        new ApiResponse(
            201,
            "User registered successfully.",
            user
        )
    );
});

export const login = asyncHandler(async (req, res) => {
    // const {indentifier, password} = req.body;
    const { user, accessToken, refreshToken }  =  await loginUser(req.validated.body);
      

    return res
    .cookie("accessToken",accessToken,accessTokenOptions)
    .cookie("refreshToken",refreshToken,refreshTokenOptions)
    .status(200).json(
        new  ApiResponse(
            200,
            "User logged in successfully.",
            user
        )
    );
});

export const getCurrentUser = asyncHandler(async (req, res) => {
    return res.status(200).json(
        new ApiResponse(
            200,
            "Current user fetched successfully.",
            req.user
        )
    );
});

export const logout = asyncHandler(async (req, res) => {
    await logoutUser(req.user.id);

    return res
        .clearCookie("accessToken", accessTokenOptions)
        .clearCookie("refreshToken", refreshTokenOptions)
        .status(200)
        .json(
            new ApiResponse(
                200,
                "User logged out successfully."
            )
        );
});

export const googleCallback = asyncHandler(async (req, res) => {
    const user = req.user;

    if (!user.phone) {
        const profileCompletionToken =
            generateProfileCompletionToken(user);

        return res.status(200).json(
            new ApiResponse(
                200,
                "Phone number is required to complete your profile.",
                {
                    requiresProfileCompletion: true,
                    profileCompletionToken,
                    
                }
            )
        );
    }

    // Normal Google login will go here later.
});


export const completeGoogleProfileController = asyncHandler(
    async (req, res) => {
        const { phone } = req.validated.body;

        const authHeader = req.headers.authorization;

        if (!authHeader?.startsWith("Bearer ")) {
            throw new ApiError(
                401,
                "Profile completion token is required."
            );
        }

        const token = authHeader.split(" ")[1];

        const { userId } =
            verifyProfileCompletionToken(token);

        const {
            user,
            accessToken,
            refreshToken,
        } = await completeGoogleProfile(userId, phone);

        return res
            .cookie("accessToken", accessToken, accessTokenOptions)
            .cookie("refreshToken", refreshToken, refreshTokenOptions)
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    "Google profile completed successfully.",
                    user
                )
            );
    }
);


export const refresh = asyncHandler(async (req, res) => {
    const refreshToken = req.cookies.refreshToken;
    const {
        accessToken,
        refreshToken: newRefreshToken,
    } = await refreshUserToken(refreshToken);
   
    return res
        .cookie(
            "accessToken",
            accessToken,
            accessTokenOptions
        )
        .cookie(
            "refreshToken",
            newRefreshToken,
            refreshTokenOptions
        )
        .status(200)
        .json(
            new ApiResponse(
                200,
                "Token refreshed successfully."
            )
        );
});