import logging
import uuid

from fastapi import Cookie, FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.agents.shopping_agent import run_shopping_agent
from app.config import AI_ALLOWED_ORIGINS
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
    except Exception:
        # Never log access tokens, cookie values, or full order payloads.
        logger.exception("AI chat request failed")
        raise

    return ChatResponse(
        conversation_id=conversation_id,
        message=result["message"],
        products=result["products"],
    )
