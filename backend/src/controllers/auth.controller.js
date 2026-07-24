import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import { registerUser } from "../services/auth.service.js";

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