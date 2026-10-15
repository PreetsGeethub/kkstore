from uuid import uuid4

import pytest
from pydantic import ValidationError

from app.schemas.chat import ChatRequest, ChatResponse


def test_chat_request_trims_message():
    request = ChatRequest(message="  show me rings  ")
    assert request.message == "show me rings"
    assert request.conversation_id is None


def test_chat_request_rejects_blank_message():
    with pytest.raises(ValidationError):
        ChatRequest(message="   ")


def test_chat_request_rejects_oversized_message():
    with pytest.raises(ValidationError):
        ChatRequest(message="x" * 2001)


def test_chat_request_accepts_uuid_conversation_id():
    conversation_id = uuid4()
    request = ChatRequest(message="find a ring", conversation_id=str(conversation_id))
    assert request.conversation_id == conversation_id


def test_chat_response_defaults_products_to_empty_list():
    response = ChatResponse(conversation_id=str(uuid4()), message="Hello")
    assert response.products == []
