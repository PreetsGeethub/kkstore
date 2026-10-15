
import asyncio
from types import SimpleNamespace
from unittest.mock import AsyncMock, patch

from app.agents import shopping_agent


def make_tool_call(name="search_products", arguments=None):
    return SimpleNamespace(
        function=SimpleNamespace(
            name=name,
            arguments=arguments or {"query": "ring"},
        )
    )


def make_response(tool_calls=None, content="Done"):
    return SimpleNamespace(
        message=SimpleNamespace(
            content=content,
            tool_calls=tool_calls or [],
        )
    )


def test_shopping_agent_never_exceeds_three_llm_calls():
    async def scenario():
        repeated_response = make_response(
            tool_calls=[make_tool_call()]
        )

        with (
            patch.object(
                shopping_agent,
                "get_conversation",
                new=AsyncMock(return_value=[]),
            ),
            patch.object(
                shopping_agent,
                "save_conversation",
                new=AsyncMock(),
            ),
            patch.object(
                shopping_agent,
                "get_ollama_tools",
                return_value=[],
            ),
            patch.object(
                shopping_agent,
                "ask_llm",
                return_value=repeated_response,
            ) as mocked_llm,
            patch.object(
                shopping_agent,
                "search_products",
                new=AsyncMock(return_value={"products": []}),
            ),
        ):
            result = await shopping_agent.run_shopping_agent(
                user_prompt="Find rings",
                access_token=None,
                conversation_id="test-conversation",
            )

        assert mocked_llm.call_count == 3
        assert result["message"]
        assert result["products"] == []

    asyncio.run(scenario())
