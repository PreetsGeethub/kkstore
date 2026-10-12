import httpx

from app.schemas.order import OrderItem, OrderSummary, OrderResult

BACKEND_URL = "http://localhost:5000"


async def get_my_orders(access_token: str | None = None):

    if not access_token:
        return {
            "success": False,
            "error_code": "AUTHENTICATION_REQUIRED",
            "message": "An authenticated user is required to access orders.",
        }

    async with httpx.AsyncClient() as client:
        response = await client.get(
            f"{BACKEND_URL}/api/v1/orders",
            cookies={
                "accessToken": access_token,
            },
        )

        print("ORDER API STATUS:", response.status_code)
        print("ORDER API RESPONSE:", response.text)
        if not access_token:
            return {
                "success": False,
                "error_code": "AUTHENTICATION_REQUIRED",
                "message": "An authenticated user is required to access orders.",
            }

    response.raise_for_status()

    data = response.json()["data"]

    orders = [
        OrderSummary(
            id=order["id"],
            order_number=order["orderNumber"],
            status=order["status"],
            total_amount=float(order["totalAmount"]),
            created_at=order["createdAt"],
            items=[
                OrderItem(
                    product_name=item["productName"],
                    quantity=item["quantity"],
                    color=item["color"],
                    size=item["size"],
                    price_at_purchase=float(item["priceAtPurchase"]),
                    line_total=float(item["lineTotal"]),
                )
                for item in order["orderItems"]
            ],
        )
        for order in data
    ]

    result = OrderResult(
        orders=orders,
        total=len(orders),
    )

    return result.model_dump()