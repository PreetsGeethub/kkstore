import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";

import {
    getAllOrders,
    getAdminOrderById,
    updateOrderStatus,
} from "../services/order.service.js";


export const getAllOrdersController = asyncHandler(
    async (req, res) => {
        const {
            orders,
            pagination,
        } = await getAllOrders(
            req.validated.query
        );

        return res.status(200).json(
            new ApiResponse(
                200,
                "Orders fetched successfully.",
                {
                    orders,
                    pagination,
                }
            )
        );
    }
);


export const getAdminOrderByIdController = asyncHandler(
    async (req, res) => {
        const { orderId } = req.validated.params;

        const order = await getAdminOrderById(
            orderId
        );

        return res.status(200).json(
            new ApiResponse(
                200,
                "Order fetched successfully.",
                order
            )
        );
    }
);


export const updateOrderStatusController = asyncHandler(
    async (req, res) => {
        const { orderId } = req.validated.params;
        const { status } = req.validated.body;

        const order = await updateOrderStatus(
            orderId,
            status
        );

        return res.status(200).json(
            new ApiResponse(
                200,
                "Order status updated successfully.",
                order
            )
        );
    }
);