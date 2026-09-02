import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";

import {
    getAllReviews,
    getAdminReviewById,
    deleteAdminReview,
} from "../services/review.service.js";


export const getAllReviewsController = asyncHandler(
    async (req, res) => {
        const reviewData = req.validated.query;

        const result = await getAllReviews(reviewData);

        return res.status(200).json(
            new ApiResponse(
                200,
                "Reviews fetched successfully.",
                result
            )
        );
    }
);


export const getAdminReviewByIdController = asyncHandler(
    async (req, res) => {
        const { reviewId } = req.validated.params;

        const review = await getAdminReviewById(reviewId);

        return res.status(200).json(
            new ApiResponse(
                200,
                "Review fetched successfully.",
                review
            )
        );
    }
);


export const deleteAdminReviewController = asyncHandler(
    async (req, res) => {
        const { reviewId } = req.validated.params;

        const review = await deleteAdminReview(reviewId);

        return res.status(200).json(
            new ApiResponse(
                200,
                "Review deleted successfully.",
                review
            )
        );
    }
);