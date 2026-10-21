import asyncio
import hashlib
from types import SimpleNamespace
from unittest.mock import AsyncMock

from fastapi.testclient import TestClient

from app import conversation
from app import main


class FakeRedis:
    def __init__(self):
        self.data = {}

    async def get(self, key):
        return self.data.get(key)

    async def set(self, key, value, ex=None):
        self.data[key] = value


def test_same_uuid_is_isolated_by_owner(monkeypatch):
    async def scenario():
        fake_redis = FakeRedis()
        monkeypatch.setattr(conversation, "redis_client", fake_redis)
        history = [{"role": "user", "content": "my private order"}]

        await conversation.save_conversation("user:alice", "same-uuid", history)

        assert await conversation.get_conversation("user:alice", "same-uuid") == history
        assert await conversation.get_conversation("user:bob", "same-uuid") == []
        assert "conversation:user:alice:same-uuid" in fake_redis.data
        assert "conversation:user:bob:same-uuid" not in fake_redis.data

    asyncio.run(scenario())


def test_guest_owner_is_a_hash_not_the_raw_cookie():
    session = "a" * 43
    owner = conversation.guest_owner_id(session)

    assert owner == "guest:" + hashlib.sha256(session.encode()).hexdigest()
    assert session not in owner


def test_guest_chat_sets_http_only_session_cookie_and_reuses_owner(monkeypatch):
    captured = []

    async def fake_run(message, *, access_token, conversation_id, owner_id):
        captured.append((message, access_token, conversation_id, owner_id))
        return {"message": "Hello", "products": []}

    async def no_authenticated_owner(_token):
        return None

    monkeypatch.setattr(main, "run_shopping_agent", fake_run)
    monkeypatch.setattr(main, "resolve_authenticated_owner", no_authenticated_owner)

    with TestClient(main.app) as client:
        first = client.post(
            "/chat",
            json={"message": "Find a ring", "conversation_id": "00000000-0000-4000-8000-000000000001"},
        )
        assert first.status_code == 200
        cookie = client.cookies.get(main.GUEST_SESSION_COOKIE)
        assert cookie
        assert first.cookies.get(main.GUEST_SESSION_COOKIE) == cookie

        second = client.post(
            "/chat",
            json={"message": "Show a cheaper one", "conversation_id": "00000000-0000-4000-8000-000000000001"},
        )
        assert second.status_code == 200

    assert captured[0][3] == captured[1][3]
    assert captured[0][2] == captured[1][2]
    assert "httponly" in first.headers["set-cookie"].lower()


def test_authenticated_chat_uses_backend_verified_owner(monkeypatch):
    captured = []

    async def fake_run(message, *, access_token, conversation_id, owner_id):
        captured.append((access_token, conversation_id, owner_id))
        return {"message": "Hello", "products": []}

    async def verified_owner(token):
        assert token == "valid-token"
        return "user:verified-customer-id"

    monkeypatch.setattr(main, "run_shopping_agent", fake_run)
    monkeypatch.setattr(main, "resolve_authenticated_owner", verified_owner)

    with TestClient(main.app) as client:
        response = client.post(
            "/chat",
            cookies={"accessToken": "valid-token"},
            json={"message": "Show my orders", "conversation_id": "00000000-0000-4000-8000-000000000002"},
        )

    assert response.status_code == 200
    assert captured == [
        ("valid-token", "00000000-0000-4000-8000-000000000002", "user:verified-customer-id")
    ]
