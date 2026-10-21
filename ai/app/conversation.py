import hashlib
import json

from app.redis import redis_client


CONVERSATION_TTL = 60 * 60  # 1 hour


def guest_owner_id(session_token: str) -> str:
    """Hash the opaque guest cookie before using it in Redis key names."""
    return "guest:" + hashlib.sha256(session_token.encode("utf-8")).hexdigest()


def _conversation_key(owner_id: str, conversation_id: str) -> str:
    """Namespace conversation history by a server-established owner."""
    if not owner_id or not conversation_id:
        raise ValueError("Conversation owner and ID are required.")

    return f"conversation:{owner_id}:{conversation_id}"


async def get_conversation(owner_id: str, conversation_id: str):
    data = await redis_client.get(
        _conversation_key(owner_id, conversation_id)
    )

    if not data:
        return []

    return json.loads(data)


async def save_conversation(
    owner_id: str,
    conversation_id: str,
    messages: list,
):
    await redis_client.set(
        _conversation_key(owner_id, conversation_id),
        json.dumps(messages),
        ex=CONVERSATION_TTL,
    )
