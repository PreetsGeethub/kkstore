
import logging
import uuid

from fastapi import Cookie, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from app.agents.shopping_agent import run_shopping_agent
from app.config import AI_ALLOWED_ORIGINS
from app.llm.quota import (
    LLMQuotaExceeded,
    LLMQuotaUnavailable,
)
from app.schemas.chat import ChatRequest, ChatResponse

logger = logging.getLogger(__name__)

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
    accessToken: str | None = Cookie(default=None),
):
    conversation_id = str(request.conversation_id or uuid.uuid4())

    try:
        result = await run_shopping_agent(
            request.message,
            access_token=accessToken,
            conversation_id=conversation_id,
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
