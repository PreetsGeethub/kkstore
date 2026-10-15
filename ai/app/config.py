"""Environment-backed configuration for the KK Store AI service."""
import os

from dotenv import load_dotenv

load_dotenv()


def _csv_env(name: str, default: str) -> list[str]:
    return [
        value.strip()
        for value in os.getenv(name, default).split(",")
        if value.strip()
    ]


BACKEND_URL = os.getenv("BACKEND_URL", "http://localhost:5000").rstrip("/")
LLM_PROVIDER = os.getenv("LLM_PROVIDER", "ollama").strip().lower()
LLM_TIMEOUT_SECONDS = float(
    os.getenv("LLM_TIMEOUT_SECONDS", os.getenv("OLLAMA_TIMEOUT_SECONDS", "120"))
)

OLLAMA_BASE_URL = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434").rstrip("/")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "qwen3:4b")
OLLAMA_TIMEOUT_SECONDS = float(
    os.getenv("OLLAMA_TIMEOUT_SECONDS", str(LLM_TIMEOUT_SECONDS))
)

OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
OPENROUTER_MODEL = os.getenv("OPENROUTER_MODEL")
OPENROUTER_BASE_URL = os.getenv(
    "OPENROUTER_BASE_URL",
    "https://openrouter.ai/api/v1",
).rstrip("/")
OPENROUTER_SITE_URL = os.getenv("OPENROUTER_SITE_URL")
OPENROUTER_APP_NAME = os.getenv("OPENROUTER_APP_NAME", "KK Store AI Assistant")

if LLM_PROVIDER not in {"ollama", "openrouter"}:
    raise ValueError("LLM_PROVIDER must be either 'ollama' or 'openrouter'.")

if LLM_PROVIDER == "openrouter":
    missing = [
        name
        for name, value in (
            ("OPENROUTER_API_KEY", OPENROUTER_API_KEY),
            ("OPENROUTER_MODEL", OPENROUTER_MODEL),
        )
        if not value
    ]
    if missing:
        raise ValueError(
            "Missing required OpenRouter configuration: " + ", ".join(missing)
        )

REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")
LLM_MAX_CALLS_PER_MINUTE = int(
    os.getenv("LLM_MAX_CALLS_PER_MINUTE", "5")
)
LLM_MAX_CALLS_PER_DAY = int(
    os.getenv("LLM_MAX_CALLS_PER_DAY", "30")
)
QDRANT_URL = os.getenv("QDRANT_URL", "http://localhost:6333")
QDRANT_API_KEY = os.getenv("QDRANT_API_KEY")
EMBEDDING_MODEL = os.getenv("EMBEDDING_MODEL", "all-MiniLM-L6-v2")
RERANKER_MODEL = os.getenv(
    "RERANKER_MODEL",
    "cross-encoder/ms-marco-MiniLM-L-6-v2",
)
HTTP_TIMEOUT_SECONDS = float(os.getenv("HTTP_TIMEOUT_SECONDS", "15"))
AI_ALLOWED_ORIGINS = _csv_env(
    "AI_ALLOWED_ORIGINS",
    "http://localhost:3000",
)
