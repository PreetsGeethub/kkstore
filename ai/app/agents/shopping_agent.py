
import json
import logging
from functools import partial
from app.llm.quota import (
    LLMQuotaExceeded,
    LLMQuotaUnavailable,
)
from pydantic import ValidationError

from app.llm.ollama import get_ollama_tools
from app.llm.client import ask_llm
from app.conversation import get_conversation, save_conversation

from app.tools.orders import get_my_orders
from app.tools.products import search_products, get_product_details
from app.tools.semantic_products import semantic_product_search
from app.tools.knowledge_tool import knowledge_search

from app.schemas.product import (
    ToolError,
    ProductSearchRequest,
    ProductDetailsRequest,
    SemanticProductSearchRequest,
)
from app.schemas.knowledge import KnowledgeSearchRequest


logger = logging.getLogger(__name__)

MAX_LLM_CALLS_PER_TURN = 3
MAX_TOOL_ROUNDS = 3


def _tool_error(error_code: str, message: str) -> dict:
    """Return tool errors in a consistent, serializable format."""
    return ToolError(
        error_code=error_code,
        message=message,
    ).model_dump()


def _parse_tool_arguments(arguments) -> dict:
    """Normalize tool arguments to a dictionary."""
    if isinstance(arguments, str):
        arguments = json.loads(arguments)

    if not isinstance(arguments, dict):
        raise ValueError("Tool arguments must be a JSON object.")

    return arguments



def _add_products(product_results: list, result) -> None:
    """Merge product results, preferring normal search over semantic matches."""
    if isinstance(result, dict):
        products = result.get("products", [])
    elif isinstance(result, list):
        products = result
    else:
        return

    # Preserve the first result for each product ID.
    existing_ids = {
        str(product["id"])
        for product in product_results
        if isinstance(product, dict) and product.get("id") is not None
    }

    for product in products:
        if not isinstance(product, dict):
            continue

        product_id = product.get("id")

        if product_id is not None and str(product_id) in existing_ids:
            continue

        if product_id is not None:
            existing_ids.add(str(product_id))

        product_results.append(product)

async def run_shopping_agent(
    user_prompt: str,
    access_token: str | None,
    conversation_id: str,
    owner_id: str,
):
    """Run one shopping-assistant turn with bounded LLM calls."""

    tools = {
        "search_products": search_products,
        "get_product_details": get_product_details,
        "get_my_orders": partial(
            get_my_orders,
            access_token=access_token,
        ),
        "semantic_product_search": semantic_product_search,
        "knowledge_search": knowledge_search,
    }

    tool_schemas = {
        "search_products": ProductSearchRequest,
        "get_product_details": ProductDetailsRequest,
        "semantic_product_search": SemanticProductSearchRequest,
        "knowledge_search": KnowledgeSearchRequest,
    }

    system_message = {
        "role": "system",
        "content": (
            "You are the AI shopping assistant for KK Store. "
            "Use the conversation history to understand references "
            "to previously discussed products, preferences, and requests. "
            "When the user says things like 'that one', 'another one', "
            "'cheaper', or 'same but black', use the conversation context "
            "to determine what they mean. "
            "When a request requires product information, use the tools. "
            "Do not describe a tool call; actually call the appropriate tool. "
            "If a tool returns an error, inspect its error_code and decide "
            "what to do next. If the error is recoverable, try an appropriate "
            "action. If it requires user action, explain what the user needs "
            "to do. Do not repeat a successful tool call with identical "
            "arguments when its result is already available. "
            "For store-policy questions, including shipping, returns, "
            "payments, warranty, and product care, use knowledge_search "
            "before answering a new question or follow-up. Reuse a previous "
            "result only when it directly answers the current question. "
            "Preserve numerical values, conditions, thresholds, and "
            "uncertainty from policy results exactly. Treat those results "
            "as the source of truth."
        ),
    }

    messages = await get_conversation(owner_id, conversation_id)

    if not messages:
        messages = [system_message]

    # Keep previous conversation context for knowledge retrieval.
    conversation_history = [
        dict(message) for message in messages
    ]

    messages.append({
        "role": "user",
        "content": user_prompt,
    })

    tools["knowledge_search"] = partial(
        knowledge_search,
        conversation_history=conversation_history,
        latest_user_message=user_prompt,
    )

    # Only collect product results generated during this turn.
    product_results = []

    llm_calls = 0
    tool_round = 0

    # First LLM request.
    response = ask_llm(
        messages,
        tools=get_ollama_tools(),
    )
    llm_calls += 1

    while True:
        tool_calls = response.message.tool_calls or []

        # The model has finished responding.
        if not tool_calls:
            content = response.message.content or ""

            if "</think>" in content:
                content = content.split("</think>", 1)[1].strip()

            messages.append({
                "role": "assistant",
                "content": content,
            })

            await save_conversation(owner_id, conversation_id, messages)

            return {
                "message": content,
                "products": product_results,
            }

        # Prevent an unbounded sequence of tool rounds.
        if tool_round >= MAX_TOOL_ROUNDS:
            final_message = (
                "I've reached the tool-execution limit for this request. "
                "Please refine your question and try again."
            )

            messages.append({
                "role": "assistant",
                "content": final_message,
            })

            await save_conversation(conversation_id, messages)

            return {
                "message": final_message,
                "products": product_results,
            }

        tool_round += 1

        # Preserve the assistant's tool requests in the conversation.
        messages.append({
            "role": "assistant",
            "content": response.message.content or "",
            "tool_calls": [
                {
                    "function": {
                        "name": call.function.name,
                        "arguments": call.function.arguments,
                    }
                }
                for call in tool_calls
            ],
        })

        # Execute every tool requested in this round.
        for tool_call in tool_calls:
            tool_name = tool_call.function.name
            tool = tools.get(tool_name)

            try:
                arguments = _parse_tool_arguments(
                    tool_call.function.arguments
                )

                if tool is None:
                    result = _tool_error(
                        "UNKNOWN_TOOL",
                        f"Unknown tool: {tool_name}",
                    )

                else:
                    schema = tool_schemas.get(tool_name)

                    if schema is not None:
                        validated_arguments = schema.model_validate(
                            arguments
                        )
                        arguments = validated_arguments.model_dump()

                    result = await tool(**arguments)

                    # Only search tools contribute to the product list.
                    if tool_name in {
                        "search_products",
                        "semantic_product_search",
                    }:
                        if tool_name == "search_products":
                            _add_products(product_results, result)

                        elif tool_name == "semantic_product_search":
                            # Semantic matches are candidates, not guaranteed exact matches.
                            # Add only products that match the user's explicit price constraint.
                            arguments_for_search = arguments
                            max_price = arguments_for_search.get("max_price")

                            semantic_products = (
                                result if isinstance(result, list) else []
                            )

                            if max_price is not None:
                                semantic_products = [
                                    product
                                    for product in semantic_products
                                    if float(product.get("price", float("inf"))) <= max_price
                                ]

                            _add_products(product_results, semantic_products)
            except ValidationError:
                logger.warning(
                    "Invalid arguments for tool %s",
                    tool_name,
                    exc_info=True,
                )
                result = _tool_error(
                    "INVALID_TOOL_ARGUMENTS",
                    f"The arguments provided to {tool_name} were invalid.",
                )

            except (ValueError, json.JSONDecodeError):
                logger.warning(
                    "Malformed arguments for tool %s",
                    tool_name,
                    exc_info=True,
                )
                result = _tool_error(
                    "INVALID_TOOL_ARGUMENTS",
                    f"The arguments provided to {tool_name} were invalid.",
                )
            except (LLMQuotaExceeded, LLMQuotaUnavailable):
                raise

            except Exception:
                logger.exception(
                    "Tool execution failed: %s",
                    tool_name,
                )
                result = _tool_error(
                    "TOOL_EXECUTION_FAILED",
                    f"The {tool_name} tool failed. Try another approach "
                    "if appropriate.",
                )

            messages.append({
                "role": "tool",
                "content": json.dumps(result, default=str),
            })

        # Do not make a fourth LLM request.
        if llm_calls >= MAX_LLM_CALLS_PER_TURN:
            if product_results:
                final_message = (
                    "I've retrieved some matching products. "
                    "Please review the available results below. "
                    "I couldn't complete the full response within "
                    "this request's LLM-call limit."
                )
            else:
                final_message = (
                    "I've reached the LLM-call limit for this request. "
                    "Please refine your question and try again."
                )

            messages.append({
                "role": "assistant",
                "content": final_message,
            })

            await save_conversation(conversation_id, messages)

            return {
                "message": final_message,
                "products": product_results,
            }

        # Request the next model response.
        response = ask_llm(
            messages,
            tools=get_ollama_tools(),
        )
        llm_calls += 1
