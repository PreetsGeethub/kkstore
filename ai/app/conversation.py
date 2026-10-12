import json

from app.redis import redis_client


CONVERSATION_TTL = 60 * 60  # 1 hour


async def get_conversation(conversation_id: str):
    data = await redis_client.get(
        f"conversation:{conversation_id}"
    )

    if not data:
        return []

    return json.loads(data)


async def save_conversation(
    conversation_id: str,
    messages: list,
):
    await redis_client.set(
        f"conversation:{conversation_id}",
        json.dumps(messages),
        ex=CONVERSATION_TTL,
    )