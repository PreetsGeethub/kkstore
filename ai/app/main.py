
import logging
import re
import secrets
import time
import uuid

from fastapi import Cookie, FastAPI, HTTPException, Response
from fastapi.middleware.cors import CORSMiddleware

from app.agents.shopping_agent import run_shopping_agent
from app.auth import resolve_authenticated_owner
from app.config import AI_ALLOWED_ORIGINS, AI_ENV
from app.conversation import guest_owner_id
from app.llm.quota import (
    LLMQuotaExceeded,
    LLMQuotaUnavailable,
)
from app.schemas.chat import ChatRequest, ChatResponse
from app.observability import log_event, reset_request_id, set_request_id

logger = logging.getLogger(__name__)

GUEST_SESSION_COOKIE = "kk_ai_guest_session"
GUEST_SESSION_MAX_AGE = 60 * 60 * 24 * 30
_GUEST_SESSION_PATTERN = re.compile(r"^[A-Za-z0-9_-]{43}$")

app = FastAPI(
    title="KK Store AI Assistant",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=AI_ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization"],
)


@app.middleware("http")
async def request_observability_middleware(request, call_next):
    """Correlate each HTTP request and record its total server-side duration."""
    supplied_id = request.headers.get("X-Request-ID", "")
    try:
        request_id = str(uuid.UUID(supplied_id))
    except (ValueError, AttributeError):
        request_id = str(uuid.uuid4())

    token = set_request_id(request_id)
    started = time.perf_counter()
    status_code = 500

    try:
        response = await call_next(request)
        status_code = response.status_code
        response.headers["X-Request-ID"] = request_id
        return response
    except Exception as exc:
        log_event(
            "http.request.exception",
            level=logging.ERROR,
            method=request.method,
            path=request.url.path,
            status_code=status_code,
            duration_ms=round((time.perf_counter() - started) * 1000, 2),
            error_type=type(exc).__name__,
        )
        raise
    finally:
        log_event(
            "http.request.completed",
            method=request.method,
            path=request.url.path,
            status_code=status_code,
            duration_ms=round((time.perf_counter() - started) * 1000, 2),
        )
        reset_request_id(token)


@app.get("/")
async def root():
    return {"message": "KK Store AI service is running"}


@app.get("/health/live")
async def health_live():
    """Lightweight liveness check for deployment platforms."""
    return {"status": "ok"}


@app.post("/chat", response_model=ChatResponse)
async def chat(
    request: ChatRequest,
    response: Response,
    accessToken: str | None = Cookie(default=None),
    kk_ai_guest_session: str | None = Cookie(default=None),
):
    # Customer identity is verified by the Node backend. The request body
    # never supplies an owner ID.
    owner_id = await resolve_authenticated_owner(accessToken)

    if owner_id is None:
        guest_session = kk_ai_guest_session
        if (
            not guest_session
            or not _GUEST_SESSION_PATTERN.fullmatch(guest_session)
        ):
            guest_session = secrets.token_urlsafe(32)
            response.set_cookie(
                key=GUEST_SESSION_COOKIE,
                value=guest_session,
                max_age=GUEST_SESSION_MAX_AGE,
                path="/",
                httponly=True,
                secure=AI_ENV == "production",
                samesite="none" if AI_ENV == "production" else "lax",
            )

        owner_id = guest_owner_id(guest_session)

    # Preserve the existing UUID conversation flow. Ownership is enforced by
    # the Redis namespace, so another owner using the same UUID sees no history.
    conversation_id = str(request.conversation_id or uuid.uuid4())

    try:
        result = await run_shopping_agent(
            request.message,
            access_token=accessToken,
            conversation_id=conversation_id,
            owner_id=owner_id,
        )

    except LLMQuotaExceeded as exc:
        logger.warning(
            "OpenRouter request blocked by quota: %s",
            exc.window,
        )
        raise HTTPException(
            status_code=429,
            detail=str(exc),
            headers={
                "Retry-After": str(exc.retry_after_seconds),
            },
        ) from exc

    except LLMQuotaUnavailable as exc:
        logger.error(
            "Redis quota check failed; refusing the LLM request."
        )
        raise HTTPException(
            status_code=503,
            detail=(
                "The AI service is temporarily unavailable. "
                "Please retry shortly."
            ),
        ) from exc

    except Exception:
        # Never log access tokens, cookie values, or full order payloads.
        logger.exception("AI chat request failed")
        raise

    return ChatResponse(
        conversation_id=conversation_id,
        message=result["message"],
        products=result["products"],
    )
