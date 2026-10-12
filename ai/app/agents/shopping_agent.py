import json
from functools import partial

from pydantic import ValidationError
from app.llm.ollama import get_ollama_tools
from app.llm.client import ask_ollama
from app.tools.orders import get_my_orders
from app.conversation import get_conversation, save_conversation
from app.tools.products import (
    search_products,
    get_product_details,
)
from app.tools.semantic_products import semantic_product_search
from app.schemas.product import (
    ToolError,
    ProductSearchRequest,
    ProductDetailsRequest,
    SemanticProductSearchRequest,
)

from app.tools.knowledge_tool import knowledge_search
from app.schemas.knowledge import KnowledgeSearchRequest
async def run_shopping_agent(
    user_prompt: str,
    access_token: str | None,
    conversation_id: str,
):
    MAX_TOOL_ROUNDS = 5 
    tool_round = 0
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
        "'cheaper', 'same but black', or similar phrases, use the "
        "conversation context to determine what they mean. "
        "When the user's request requires product information, "
        "use the provided tools. "
        "Do not describe a tool call in your response. "
        "Actually call the appropriate tool. "
        "If a tool returns an error, inspect the error_code "
        "and decide what to do next. "
        "If the error is recoverable, try an appropriate action "
        "instead of immediately giving up. "
        "If the error requires user action, clearly explain "
        "what the user needs to do. "
        "Do not repeat the same tool call with the same arguments "
        "when a successful result for that request is already available. "
        "Use the existing tool result instead."
        "For questions about store policies—including shipping, returns, "
        "payments, warranty, and product care—use knowledge_search before "
        "answering a new policy question or follow-up. A previous tool result "
        "may be reused only if it directly answers the current question. "

        "When using a successful knowledge_search result, preserve numerical "
        "values, thresholds, conditions, and uncertainty exactly. Do not "
        "change numbers or turn qualified statements such as 'may have "
        "applicable charges' into definite claims. Treat the tool result as "
        "the source of truth for store policies. "
    ),
}

    messages = await get_conversation(conversation_id)

    if not messages:
        messages = [system_message]

    # Snapshot the previous conversation before adding the new turn.
    conversation_history = [
        dict(message) for message in messages
    ]

    messages.append(
        {
            "role": "user",
            "content": user_prompt,
        }
    )

    # Bind context internally; Qwen still supplies only `query`.
    tools["knowledge_search"] = partial(
        knowledge_search,
        conversation_history=conversation_history,
        latest_user_message=user_prompt,
    )

    product_results = []

    for message in messages:
        if message.get("role") != "tool":
            continue

        try:
            result = json.loads(message["content"])
        except (json.JSONDecodeError, TypeError):
            continue

        if "products" in result:
            product_results.extend(result["products"])

    response = ask_ollama(messages, tools=get_ollama_tools())

    while tool_round < MAX_TOOL_ROUNDS:
        tool_round += 1
        tool_calls = response.message.tool_calls

        if not tool_calls:
            content = response.message.content

            if "</think>" in content:
                content = content.split("</think>", 1)[1].strip()

            await save_conversation(
                conversation_id,
                messages,
            )

            return {
                "message": content,
                "products": product_results,
            }

        print("The model requested a tool.")

        messages.append(
            {
                "role": "assistant",
                "content": response.message.content,
                "tool_calls": [
                    {
                        "function": {
                            "name": tool_call.function.name,
                            "arguments": tool_call.function.arguments,
                        }
                    }
                    for tool_call in tool_calls
                ],
            }
        )

        for tool_call in tool_calls:
            tool_name = tool_call.function.name
            arguments = tool_call.function.arguments

            print("TOOL NAME:")
            print(tool_name)

            print("TOOL ARGUMENTS:")
            print(arguments)

            tool = tools.get(tool_name)

            if tool is None:
                result = {
                    "success": False,
                    "message": f"Unknown tool requested: {tool_name}",
                }

            else:
                try:
                    schema = tool_schemas.get(tool_name)

                    if schema:
                        validated_arguments = schema(**arguments)

                        result = await tool(
                            **validated_arguments.model_dump()
                        )
                    else:
                        result = await tool(**arguments)

                except ValidationError as e:
                    result = {
                        "success": False,
                        "error_code": "INVALID_TOOL_ARGUMENTS",
                        "message": (
                            f"Invalid arguments for {tool_name}: "
                            f"{str(e)}"
                        ),
                    }

                except Exception as e:
                    print("TOOL ERROR TYPE:")
                    print(type(e).__name__)

                    print("TOOL ERROR:")
                    print(str(e))

                    tool_error = ToolError(
                        error_code="TOOL_EXECUTION_FAILED",
                        message=f"The {tool_name} tool failed.",
                    )

                    result = tool_error.model_dump()

            if tool_name == "search_products":
                product_results.extend(
                    result.get("products", [])
                )

            elif tool_name == "semantic_product_search":
                product_results.extend(result)

            print("TOOL RESULT:")
            print(result)

            messages.append(
                {
                    "role": "tool",
                    "content": json.dumps(result),
                }
            )

        response = ask_ollama(messages, tools=get_ollama_tools())
    return {
    "message": (
        "I couldn't complete the request after several tool attempts. "
        "Please try again."
    ),
    "products": product_results,
    }