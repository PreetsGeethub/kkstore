"""Provider-neutral LLM client for local Ollama and hosted OpenRouter."""
import json
import logging
from functools import lru_cache
from types import SimpleNamespace

import ollama
from openai import OpenAI

from app.config import (
    LLM_PROVIDER,
    LLM_TIMEOUT_SECONDS,
    OLLAMA_BASE_URL,
    OLLAMA_MODEL,
    OLLAMA_TIMEOUT_SECONDS,
    OPENROUTER_API_KEY,
    OPENROUTER_APP_NAME,
    OPENROUTER_BASE_URL,
    OPENROUTER_MODEL,
    OPENROUTER_SITE_URL,
)

logger = logging.getLogger(__name__)

ollama_client = ollama.Client(
    host=OLLAMA_BASE_URL,
    timeout=OLLAMA_TIMEOUT_SECONDS,
)


@lru_cache(maxsize=1)
def _get_openrouter_client() -> OpenAI:
    """Create the hosted provider client only when it is needed."""
    if not OPENROUTER_API_KEY:
        raise RuntimeError("OPENROUTER_API_KEY is required when LLM_PROVIDER=openrouter.")

    return OpenAI(
        api_key=OPENROUTER_API_KEY,
        base_url=OPENROUTER_BASE_URL,
        timeout=LLM_TIMEOUT_SECONDS,
    )


def _to_openrouter_messages(messages: list[dict]) -> list[dict]:
    """Translate conversation history into OpenAI-compatible tool-call format."""
    converted = []
    pending_tool_calls: list[tuple[str, str]] = []

    for message_index, message in enumerate(messages):
        role = message.get("role")

        if role == "assistant" and message.get("tool_calls"):
            formatted_calls = []

            for call_index, tool_call in enumerate(message["tool_calls"]):
                function = tool_call.get("function", {})
                name = function.get("name")
                if not name:
                    logger.warning("Skipping a tool call with no function name.")
                    continue

                call_id = tool_call.get("id") or f"call_{message_index}_{call_index}"
                arguments = function.get("arguments", {})
                if not isinstance(arguments, str):
                    arguments = json.dumps(arguments)

                formatted_calls.append(
                    {
                        "id": call_id,
                        "type": "function",
                        "function": {
                            "name": name,
                            "arguments": arguments,
                        },
                    }
                )
                pending_tool_calls.append((call_id, name))

            converted.append(
                {
                    "role": "assistant",
                    "content": message.get("content") or None,
                    "tool_calls": formatted_calls,
                }
            )
            continue

        if role == "tool":
            if not pending_tool_calls:
                logger.warning("Skipping an orphaned tool response in conversation history.")
                continue

            call_id, name = pending_tool_calls.pop(0)
            converted.append(
                {
                    "role": "tool",
                    "tool_call_id": call_id,
                    "name": name,
                    "content": message.get("content", ""),
                }
            )
            continue

        converted.append(
            {
                key: message[key]
                for key in ("role", "content", "name")
                if key in message
            }
        )

    return converted


def _normalize_openrouter_response(response):
    """Expose hosted responses in the shape expected by the existing agent."""
    message = response.choices[0].message
    normalized_calls = []

    for tool_call in message.tool_calls or []:
        raw_arguments = tool_call.function.arguments or "{}"
        try:
            arguments = (
                json.loads(raw_arguments)
                if isinstance(raw_arguments, str)
                else raw_arguments
            )
        except json.JSONDecodeError:
            logger.warning("The model returned malformed JSON tool arguments.")
            arguments = {}

        if not isinstance(arguments, dict):
            logger.warning("The model returned non-object tool arguments.")
            arguments = {}

        normalized_calls.append(
            SimpleNamespace(
                function=SimpleNamespace(
                    name=tool_call.function.name,
                    arguments=arguments,
                )
            )
        )

    return SimpleNamespace(
        message=SimpleNamespace(
            content=message.content or "",
            tool_calls=normalized_calls,
        )
    )


def ask_llm(messages, tools=None):
    """Call the configured provider and return a consistent response shape."""
    if LLM_PROVIDER == "ollama":
        return ollama_client.chat(
            model=OLLAMA_MODEL,
            messages=messages,
            tools=tools,
            think=False,
        )

    headers = {"X-Title": OPENROUTER_APP_NAME} if OPENROUTER_APP_NAME else {}
    if OPENROUTER_SITE_URL:
        headers["HTTP-Referer"] = OPENROUTER_SITE_URL

    response = _get_openrouter_client().chat.completions.create(
        model=OPENROUTER_MODEL,
        messages=_to_openrouter_messages(messages),
        tools=tools,
        extra_headers=headers or None,
    )
    return _normalize_openrouter_response(response)
