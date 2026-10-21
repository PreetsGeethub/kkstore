from pydantic import BaseModel
from typing import Optional


class OrderItem(BaseModel):
    product_name: str
    quantity: int
    color: str
    size: Optional[str] = None
    price_at_purchase: float
    line_total: float


class OrderSummary(BaseModel):
    id: str
    order_number: str
    status: str
    total_amount: float
    created_at: str
    items: list[OrderItem]


class OrderResult(BaseModel):
    orders: list[OrderSummary]
    total: int
    