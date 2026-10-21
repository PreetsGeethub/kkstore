
import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.agents import shopping_agent
from app.llm import client as llm_client
from app.llm.quota import LLMQuotaExceeded, LLMQuotaUnavailable


@pytest.mark.parametrize(
    ("failure_type", "expected_status", "expected_retry_after"),
    [
        ("minute", 429, "17"),
        ("redis", 503, None),
    ],
)
def test_chat_handles_quota_failures_without_calling_provider(
    monkeypatch,
    failure_type,
    expected_status,
    expected_retry_after,
):
    async def empty_conversation(_owner_id, _conversation_id):
        return []

    monkeypatch.setattr(
        shopping_agent,
        "get_conversation",
        empty_conversation,
    )
    monkeypatch.setattr(
        shopping_agent,
        "get_ollama_tools",
        lambda: [],
    )

    # Route the agent through the real provider dispatcher.
    monkeypatch.setattr(
        llm_client,
        "LLM_PROVIDER",
        "openrouter",
    )
    monkeypatch.setattr(
        shopping_agent,
        "ask_llm",
        llm_client.ask_llm,
    )

    # Simulate quota denial or Redis unavailability.
    def deny_quota():
        if failure_type == "minute":
            raise LLMQuotaExceeded("minute", 17)

        raise LLMQuotaUnavailable(
            "Could not verify the request budget."
        )

    monkeypatch.setattr(
        llm_client,
        "reserve_llm_call",
        deny_quota,
    )

    provider_calls = []

    def unexpected_provider_call(*args, **kwargs):
        provider_calls.append(True)
        pytest.fail("OpenRouter must not be called")

    monkeypatch.setattr(
        llm_client,
        "ask_openrouter",
        unexpected_provider_call,
    )

    with TestClient(app) as test_client:
        response = test_client.post(
            "/chat",
            json={
                "message": "Find rings under 5000",
                "conversation_id": "00000000-0000-4000-8000-000000000001",
            },
        )

    assert response.status_code == expected_status
    assert provider_calls == []

    if expected_retry_after is not None:
        assert response.headers["Retry-After"] == expected_retry_after
