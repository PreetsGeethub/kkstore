from uuid import UUID

from pydantic import BaseModel, Field, field_validator

from app.schemas.product import ProductSearchItem


class ChatRequest(BaseModel):
    message: str = Field(min_length=1, max_length=2000)
    conversation_id: UUID | None = None

    @field_validator("message")
    @classmethod
    def reject_blank_message(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("Message must not be blank.")
        return value


class ChatResponse(BaseModel):
    conversation_id: str
    message: str
    products: list[ProductSearchItem] = Field(default_factory=list)
