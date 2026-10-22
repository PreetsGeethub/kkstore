"""Small, dependency-free structured observability helpers for the AI service."""

import contextvars
import json
import logging
from datetime import datetime, timezone
from typing import Any

_request_id: contextvars.ContextVar[str | None] = contextvars.ContextVar(
    "kk_ai_request_id",
    default=None,
)

logger = logging.getLogger("kkstore.observability")


def set_request_id(request_id: str):
    """Set the request ID for the current async context and return its token."""
    return _request_id.set(request_id)


def reset_request_id(token) -> None:
    """Restore the previous request ID."""
    _request_id.reset(token)


def current_request_id() -> str | None:
    return _request_id.get()


def log_event(event: str, level: int = logging.INFO, **fields: Any) -> None:
    """Emit one JSON log line without request content or credentials."""
    payload = {
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "event": event,
        "request_id": current_request_id(),
        **fields,
    }
    logger.log(level, json.dumps(payload, default=str, separators=(",", ":")))
