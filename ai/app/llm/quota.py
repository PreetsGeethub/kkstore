
from datetime import datetime, timedelta, timezone

from redis.exceptions import RedisError

from app.config import (
    LLM_MAX_CALLS_PER_DAY,
    LLM_MAX_CALLS_PER_MINUTE,
)
from app.redis import sync_redis_client


_QUOTA_SCRIPT = """
local minute_count = tonumber(redis.call('GET', KEYS[1]) or '0')
local day_count = tonumber(redis.call('GET', KEYS[2]) or '0')

local minute_limit = tonumber(ARGV[1])
local day_limit = tonumber(ARGV[2])

if minute_count >= minute_limit then
    return {0, 1, minute_count, day_count}
end

if day_count >= day_limit then
    return {0, 2, minute_count, day_count}
end

local new_minute_count = redis.call('INCR', KEYS[1])
if new_minute_count == 1 then
    redis.call('EXPIRE', KEYS[1], tonumber(ARGV[3]))
end

local new_day_count = redis.call('INCR', KEYS[2])
if new_day_count == 1 then
    redis.call('EXPIRE', KEYS[2], tonumber(ARGV[4]))
end

return {1, 0, new_minute_count, new_day_count}
"""


class LLMQuotaExceeded(RuntimeError):
    def __init__(self, window: str, retry_after_seconds: int):
        self.window = window
        self.retry_after_seconds = max(1, retry_after_seconds)

        if window == "minute":
            message = (
                "The OpenRouter request limit has been reached. "
                "Please retry shortly."
            )
        else:
            message = (
                "The daily OpenRouter request budget has been reached. "
                "Please try again after the daily reset."
            )

        super().__init__(message)


class LLMQuotaUnavailable(RuntimeError):
    """Raised when quota checks cannot safely be completed."""


def reserve_llm_call() -> None:
    """Atomically reserve one OpenRouter request in the shared budget."""

    now = datetime.now(timezone.utc)

    minute_bucket = int(now.timestamp() // 60)
    day_bucket = now.strftime("%Y%m%d")

    minute_key = f"kkstore:quota:openrouter:minute:{minute_bucket}"
    day_key = f"kkstore:quota:openrouter:day:{day_bucket}"

    try:
        result = sync_redis_client.eval(
            _QUOTA_SCRIPT,
            2,
            minute_key,
            day_key,
            LLM_MAX_CALLS_PER_MINUTE,
            LLM_MAX_CALLS_PER_DAY,
            120,      # Minute counter expiry in seconds.
            172800,   # Daily counter expiry in seconds.
        )
    except RedisError as exc:
        # Fail closed: do not call OpenRouter if we cannot
        # verify the shared quota.
        raise LLMQuotaUnavailable(
            "Could not verify the OpenRouter request budget."
        ) from exc

    allowed, reason, _, _ = [int(value) for value in result]

    if allowed:
        return

    if reason == 1:
        retry_after = 60 - (int(now.timestamp()) % 60)
        raise LLMQuotaExceeded("minute", retry_after)

    tomorrow_utc = datetime.combine(
        now.date() + timedelta(days=1),
        datetime.min.time(),
        tzinfo=timezone.utc,
    )
    retry_after = int((tomorrow_utc - now).total_seconds())

    raise LLMQuotaExceeded("day", retry_after)
