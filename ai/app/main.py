from fastapi import FastAPI, Cookie,Request

from app.agents.shopping_agent import run_shopping_agent
from app.schemas.chat import ChatRequest, ChatResponse
from fastapi.middleware.cors import CORSMiddleware
import uuid

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {
        "message": "KK Store AI service is running"
    }

@app.post("/chat", response_model=ChatResponse)
async def chat(
    request: ChatRequest,
    http_request: Request,
    accessToken: str | None = Cookie(default=None),
):
    print("ACCESS TOKEN RECEIVED:", accessToken is not None)
    print("COOKIES RECEIVED:", list(http_request.cookies.keys()))

    conversation_id = request.conversation_id or str(uuid.uuid4())

    result = await run_shopping_agent(
        request.message,
        access_token=accessToken,
        conversation_id=conversation_id,
    )

    return ChatResponse(
        conversation_id=conversation_id,
        message=result["message"],
        products=result["products"],
    )