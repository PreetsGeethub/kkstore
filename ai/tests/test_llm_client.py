from types import SimpleNamespace

from app.llm.openrouter import (
    normalize_response as _normalize_openrouter_response,
    convert_messages as _to_openrouter_messages,
)


def test_openrouter_messages_include_tool_call_ids_and_json_arguments():
    messages = [
        {"role": "user", "content": "Find me a ring"},
        {
            "role": "assistant",
            "content": "",
            "tool_calls": [
                {
                    "function": {
                        "name": "search_products",
                        "arguments": {"query": "ring", "max_price": 5000},
                    }
                }
            ],
        },
        {"role": "tool", "content": '{"products": []}'},
    ]

    converted = _to_openrouter_messages(messages)

    assert converted[1]["tool_calls"][0]["id"] == "call_1_0"
    assert converted[1]["tool_calls"][0]["type"] == "function"
    assert converted[1]["tool_calls"][0]["function"]["arguments"] == (
        '{"query": "ring", "max_price": 5000}'
    )
    assert converted[2]["role"] == "tool"
    assert converted[2]["tool_call_id"] == "call_1_0"
    assert converted[2]["name"] == "search_products"


def test_openrouter_messages_pair_multiple_tool_results_in_order():
    messages = [
        {
            "role": "assistant",
            "content": None,
            "tool_calls": [
                {"function": {"name": "search_products", "arguments": {"query": "ring"}}},
                {"function": {"name": "get_product_details", "arguments": {"product_id": "p1"}}},
            ],
        },
        {"role": "tool", "content": '{"products": []}'},
        {"role": "tool", "content": '{"id": "p1"}'},
    ]

    converted = _to_openrouter_messages(messages)

    assert converted[1]["tool_call_id"] == "call_0_0"
    assert converted[1]["name"] == "search_products"
    assert converted[2]["tool_call_id"] == "call_0_1"
    assert converted[2]["name"] == "get_product_details"


def test_openrouter_response_arguments_are_normalized_to_dicts():
    response = SimpleNamespace(
        choices=[
            SimpleNamespace(
                message=SimpleNamespace(
                    content=None,
                    tool_calls=[
                        SimpleNamespace(
                            function=SimpleNamespace(
                                name="search_products",
                                arguments='{"query": "ring"}',
                            )
                        )
                    ],
                )
            )
        ]
    )

    normalized = _normalize_openrouter_response(response)

    assert normalized.message.content == ""
    assert normalized.message.tool_calls[0].function.name == "search_products"
    assert normalized.message.tool_calls[0].function.arguments == {"query": "ring"}
