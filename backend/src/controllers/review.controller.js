import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";

import {
    createReview,
    getProductReviews,
    updateReview,
    deleteReview,
} from "../services/review.service.js";

export const createReviewController = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const reviewData = req.validated.body;

    const review = await createReview(userId, reviewData);

    return res.status(201).json(
        new ApiResponse(
            201,
            "Review created successfully.",
            review
        )
    );
});

export const getProductReviewsController = asyncHandler(async (req, res) => {
    const { productId } = req.validated.params;

    const reviews = await getProductReviews(productId);

    return res.status(200).json(
        new ApiResponse(
            200,
            "Reviews fetched successfully.",
            reviews
        )
    );
});

export const updateReviewController = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { reviewId } = req.validated.params;
    const reviewData = req.validated.body;

    const review = await updateReview(
        userId,
        reviewId,
        reviewData
    );

    return res.status(200).json(
        new ApiResponse(
            200,
            "Review updated successfully.",
            review
        )
    );
});

export const deleteReviewController = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { reviewId } = req.validated.params;

    const review = await deleteReview(
        userId,
        reviewId
    );

    return res.status(200).json(
        new ApiResponse(
            200,
            "Review deleted successfully.",
            review
        )
    );
});