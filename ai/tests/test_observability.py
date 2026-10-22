import json
import logging

from app.observability import log_event, reset_request_id, set_request_id


def test_structured_events_include_request_id(caplog):
    token = set_request_id("test-request-id")
    try:
        with caplog.at_level(logging.INFO, logger="kkstore.observability"):
            log_event("test.event", duration_ms=12.5, status="ok")
    finally:
        reset_request_id(token)

    record = next(
        record for record in caplog.records
        if record.name == "kkstore.observability"
    )
    payload = json.loads(record.message)

    assert payload["event"] == "test.event"
    assert payload["request_id"] == "test-request-id"
    assert payload["duration_ms"] == 12.5
    assert payload["status"] == "ok"
