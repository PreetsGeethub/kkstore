
"""Provider-neutral LLM client."""

from app.config import (
    LLM_PROVIDER,
    OLLAMA_BASE_URL,
    OLLAMA_MODEL,
    OLLAMA_TIMEOUT_SECONDS,
)
from app.llm.openrouter import ask_openrouter
from app.llm.quota import reserve_llm_call


# Load Ollama only when it is the selected provider.
if LLM_PROVIDER == "ollama":
    import ollama

    ollama_client = ollama.Client(
        host=OLLAMA_BASE_URL,
        timeout=OLLAMA_TIMEOUT_SECONDS,
    )
else:
    ollama_client = None


def ask_llm(messages, tools=None):
    """Call the configured LLM provider."""

    if LLM_PROVIDER == "ollama":
        return ollama_client.chat(
            model=OLLAMA_MODEL,
            messages=messages,
            tools=tools,
            think=False,
        )

    if LLM_PROVIDER == "openrouter":
        # Reserve a shared quota slot before making the API request.
        reserve_llm_call()
        return ask_openrouter(messages, tools)

    raise ValueError(f"Unsupported LLM provider: {LLM_PROVIDER}")
