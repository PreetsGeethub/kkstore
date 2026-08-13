import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import { createOrder, getOrders, getOrderById, cancelOrder } from "../services/order.service.js";


export const createOrderController = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const orderData = req.validated.body;

    const order = await createOrder(orderData,userId);

    res.status(201).json(
        new ApiResponse(
            201,
            "Order created successfully.",
            order
        )
    );
}

);

export const getOrderController = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const orders = await getOrders(userId);

    return res.status(200).json(
        new ApiResponse(
            200,
            "Order Fetched Successfully",
            orders
        )
    )

});

export const  getOrderByIdController = asyncHandler( async (req,res) => {
    const userId = req.user.id;
    const {orderId} = req.validated.params;

    const order  = await getOrderById(orderId,userId);

    return res.status(200).json(
        new ApiResponse(
            200,
            "Order Fetched SuccesFully !!",
            order
        )
    )
})

export const cancelOrderController = asyncHandler( async ( req, res) => {
    const userId = req.user.id;
    const {orderId} = req.validated.params;

    const order = await cancelOrder(orderId,userId);

    return res.status(201).json(
        new  ApiResponse(
            201,
            "Order cancelled successfully !!",
            order
        )
    )
})