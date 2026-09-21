import { Router } from "express";
import multer from "multer";
import protect from "../middleware/protect.middleware.js";
import admin from "../middleware/admin.middleware.js";
import cloudinary from "../config/cloudinary.js";
import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";

const upload = multer({ storage: multer.memoryStorage() });
const router = Router();

router.post(
    "/",
    protect,
    admin,
    upload.single("image"),
    asyncHandler(async (req, res) => {
        if (!req.file) {
            throw new ApiError(400, "No image file provided.");
        }

        const uploadResult = await new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
                { folder: "kk-store" },
                (error, result) => {
                    if (error) reject(error);
                    else resolve(result);
                }
            );
            stream.end(req.file.buffer);
        });

        return res.status(201).json(
            new ApiResponse(201, "Image uploaded successfully.", {
                imageUrl: uploadResult.secure_url,
            })
        );
    })
);

export default router;