
import pytest

import app.llm.client as llm_client
import app.llm.quota as quota


class FakeRedis:
    def __init__(self, result=None, error=None):
        self.result = result
        self.error = error
        self.calls = []

    def eval(self, *args):
        self.calls.append(args)

        if self.error:
            raise self.error

        return self.result


def test_quota_reservation_uses_atomic_redis_script(monkeypatch):
    fake = FakeRedis(result=[1, 0, 1, 1])
    monkeypatch.setattr(quota, "sync_redis_client", fake)

    quota.reserve_llm_call()

    assert len(fake.calls) == 1
    assert fake.calls[0][1] == 2
    assert fake.calls[0][2].startswith(
        "kkstore:quota:openrouter:minute:"
    )
    assert fake.calls[0][3].startswith(
        "kkstore:quota:openrouter:day:"
    )


def test_minute_limit_is_enforced(monkeypatch):
    fake = FakeRedis(result=[0, 1, 5, 10])
    monkeypatch.setattr(quota, "sync_redis_client", fake)

    with pytest.raises(quota.LLMQuotaExceeded) as exc:
        quota.reserve_llm_call()

    assert exc.value.window == "minute"
    assert exc.value.retry_after_seconds > 0


def test_daily_limit_is_enforced(monkeypatch):
    fake = FakeRedis(result=[0, 2, 3, 30])
    monkeypatch.setattr(quota, "sync_redis_client", fake)

    with pytest.raises(quota.LLMQuotaExceeded) as exc:
        quota.reserve_llm_call()

    assert exc.value.window == "day"
    assert exc.value.retry_after_seconds > 0


def test_redis_failure_blocks_llm_calls(monkeypatch):
    from redis.exceptions import ConnectionError as RedisConnectionError

    fake = FakeRedis(error=RedisConnectionError("Redis unavailable"))
    monkeypatch.setattr(quota, "sync_redis_client", fake)

    with pytest.raises(quota.LLMQuotaUnavailable):
        quota.reserve_llm_call()


def test_quota_denial_prevents_openrouter_request(monkeypatch):
    monkeypatch.setattr(llm_client, "LLM_PROVIDER", "openrouter")

    def deny_request():
        raise quota.LLMQuotaExceeded("minute", 10)

    monkeypatch.setattr(
        llm_client,
        "reserve_llm_call",
        deny_request,
    )

    def unexpected_provider_call(*args, **kwargs):
        pytest.fail("OpenRouter must not be called when quota is denied")

    monkeypatch.setattr(
        llm_client,
        "ask_openrouter",
        unexpected_provider_call,
    )

    with pytest.raises(quota.LLMQuotaExceeded):
        llm_client.ask_llm([], tools=[])
