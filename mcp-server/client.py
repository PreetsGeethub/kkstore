
import anyio
import json
import os

from dotenv import load_dotenv
from mcp import Client
from openai import OpenAI


# 1. Load environment variables and configure OpenRouter
load_dotenv()

api_key = os.getenv("OPENROUTER_API_KEY")

if not api_key:
    raise RuntimeError("OPENROUTER_API_KEY is not set")

openrouter_client = OpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key=api_key,
)


# 2. Convert MCP tool definitions into OpenRouter's format
def convert_mcp_tools(mcp_tools):
    llm_tools = []

    for tool in mcp_tools:
        llm_tool = {
            "type": "function",
            "function": {
                "name": tool.name,
                "description": tool.description or "",
                "parameters": tool.input_schema,
            },
        }

        llm_tools.append(llm_tool)

    return llm_tools


async def main() -> None:

    # 3. Connect to our MCP server
    async with Client("http://localhost:8000/mcp") as client:

        # Discover the tools exposed by the server
        result = await client.list_tools()

        # Convert them into the format OpenRouter expects
        llm_tools = convert_mcp_tools(result.tools)

        # 4. Keep track of the conversation
        messages = [
            {
                "role": "user",
                "content": "Calculate 125 + 347 using the add tool.",
            }
        ]

        # 5. Send the question and available tools to the LLM
        response = openrouter_client.chat.completions.create(
            model="openrouter/free",
            messages=messages,
            tools=llm_tools,
            tool_choice="auto",
        )

        # Extract the assistant's message from the API response
        message = response.choices[0].message

        # 6. Check whether the LLM requested any tools
        if message.tool_calls:

            # Save the assistant's tool-call request in the history
            messages.append(message.model_dump(exclude_none=True))

            # Process each tool call requested by the LLM
            for tool_call in message.tool_calls:

                # Extract the requested tool name and arguments
                tool_name = tool_call.function.name
                arguments = json.loads(
                    tool_call.function.arguments
                )

                print(f"Calling MCP tool: {tool_name}")
                print(f"Arguments: {arguments}")

                # Execute the requested tool through MCP
                tool_result = await client.call_tool(
                    tool_name,
                    arguments,
                )

                print(
                    "MCP result:",
                    tool_result.structured_content,
                )

                # 7. Send this tool's result back into the conversation
                messages.append({
                    "role": "tool",
                    "tool_call_id": tool_call.id,
                    "content": json.dumps(
                        tool_result.structured_content
                    ),
                })

            # 8. Ask the LLM to formulate the final answer
            final_response = openrouter_client.chat.completions.create(
                model="openrouter/free",
                messages=messages,
            )

            final_message = final_response.choices[0].message

            print("Final answer:", final_message.content)

        else:
            # The LLM answered without requesting a tool
            print("Final answer:", message.content)


if __name__ == "__main__":
    anyio.run(main)
