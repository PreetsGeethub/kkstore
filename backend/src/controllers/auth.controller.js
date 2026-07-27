import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import { registerUser, loginUser, logoutUser, refreshUserToken } from "../services/auth.service.js";
import {
    accessTokenOptions,
    refreshTokenOptions,
} from "../utils/cookieOptions.js";

export const register = asyncHandler(async (req, res) => {
    const userData = req.body;

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
    const { user, accessToken, refreshToken }  =  await loginUser(req.body);
      

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