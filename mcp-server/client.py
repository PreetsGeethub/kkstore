
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
        
        MAX_TOOL_ROUNDS = 3
        MAX_TOOL_CALLS = 5
        total_tool_calls = 0

        for round_number in range(MAX_TOOL_ROUNDS):

            # Ask the LLM what to do next
            response = openrouter_client.chat.completions.create(
                model="openrouter/free",
                messages=messages,
                tools=llm_tools,
                tool_choice="auto",
            )

            message = response.choices[0].message

            # If the LLM didn't request tools, we're done
            if not message.tool_calls:
                print("Final answer:", message.content)
                break

            # Save the assistant's tool-call request
            messages.append(message.model_dump(exclude_none=True))

            # Execute each requested tool

            
            limit_reached = False

            for tool_call in message.tool_calls:
                if total_tool_calls >= MAX_TOOL_CALLS:
                    limit_reached = True
                    print("Tool-call limit reached. Stopping the agent.")
                    break

                tool_name = tool_call.function.name
                arguments = json.loads(tool_call.function.arguments)

                print(f"Round: {round_number + 1}")
                print(f"Calling MCP tool: {tool_name}")
                print(f"Arguments: {arguments}")

                total_tool_calls += 1

                try:
                    tool_result = await client.call_tool(
                        tool_name,
                        arguments,
                    )

                    if tool_result.is_error:
                        result_content = {
                            "error": True,
                            "message": str(tool_result.content),
                        }
                    else:
                        result_content = {
                            "error": False,
                            "data": tool_result.structured_content,
                        }

                except Exception as exc:
                    result_content = {
                        "error": True,
                        "message": "Tool execution failed.",
                    }

                messages.append({
                    "role": "tool",
                    "tool_call_id": tool_call.id,
                    "content": json.dumps(result_content),
                })

                print("Tool outcome:", result_content)

       

            if limit_reached:
                print("Agent stopped before executing additional tools.")
                return

        else:
            # The loop ended because the maximum was reached
            print("Maximum tool-call rounds reached.")



if __name__ == "__main__":
    anyio.run(main)
