
"""OpenRouter LLM provider using the OpenAI-compatible API."""

import json
import logging
from functools import lru_cache
from types import SimpleNamespace

from openai import OpenAI

from app.config import (
    LLM_TIMEOUT_SECONDS,
    OPENROUTER_API_KEY,
    OPENROUTER_APP_NAME,
    OPENROUTER_BASE_URL,
    OPENROUTER_MODEL,
    OPENROUTER_SITE_URL,
)

logger = logging.getLogger(__name__)


@lru_cache(maxsize=1)
def get_openrouter_client() -> OpenAI:
    """Create the OpenRouter client lazily."""
    if not OPENROUTER_API_KEY:
        raise RuntimeError(
            "OPENROUTER_API_KEY is required when using OpenRouter."
        )

    return OpenAI(
        api_key=OPENROUTER_API_KEY,
        base_url=OPENROUTER_BASE_URL,
        timeout=LLM_TIMEOUT_SECONDS,
          max_retries=0,
    )


def convert_messages(messages: list[dict]) -> list[dict]:
    """Convert agent conversation history to OpenAI-compatible format."""
    converted = []
    pending_tool_calls = []

    for message_index, message in enumerate(messages):
        role = message.get("role")

        if role == "assistant" and message.get("tool_calls"):
            formatted_calls = []

            for call_index, tool_call in enumerate(message["tool_calls"]):
                function = tool_call.get("function", {})
                name = function.get("name")

                if not name:
                    logger.warning("Skipping tool call without a function name.")
                    continue

                call_id = tool_call.get("id") or (
                    f"call_{message_index}_{call_index}"
                )

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
                logger.warning("Skipping orphaned tool response.")
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


def normalize_response(response):
    """Return a response compatible with the existing agent's expectations."""
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
            logger.warning("Model returned malformed tool-call JSON.")
            arguments = {}

        if not isinstance(arguments, dict):
            logger.warning("Model returned non-object tool arguments.")
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


def ask_openrouter(messages, tools=None):
    """Send a chat completion request to OpenRouter."""
    headers = {}

    if OPENROUTER_APP_NAME:
        headers["X-Title"] = OPENROUTER_APP_NAME

    if OPENROUTER_SITE_URL:
        headers["HTTP-Referer"] = OPENROUTER_SITE_URL

    response = get_openrouter_client().chat.completions.create(
        model=OPENROUTER_MODEL,
        messages=convert_messages(messages),
        tools=tools,
        extra_headers=headers or None,
    )

    return normalize_response(response)
