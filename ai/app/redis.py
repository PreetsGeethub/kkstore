import redis as sync_redis
import redis.asyncio as async_redis

from app.config import REDIS_URL


# Existing client for asynchronous application operations.
redis_client = async_redis.Redis.from_url(
    REDIS_URL,
    decode_responses=True,
)

# Client for synchronous LLM quota checks.
sync_redis_client = sync_redis.Redis.from_url(
    REDIS_URL,
    decode_responses=True,
)