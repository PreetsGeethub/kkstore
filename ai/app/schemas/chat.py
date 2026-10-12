
from pydantic import BaseModel, Field

from app.schemas.product import ProductSearchItem


class ChatRequest(BaseModel):
    message: str
    conversation_id: str | None = None


class ChatResponse(BaseModel):
    conversation_id: str
    message: str
    products: list[ProductSearchItem] = Field(default_factory=list)