
import anyio
import json
import os
import webbrowser
from urllib.parse import parse_qs, urlparse

import httpx2
from dotenv import load_dotenv
from mcp import Client
from mcp.client.auth import AuthorizationCodeResult, OAuthClientProvider, TokenStorage
from mcp.client.streamable_http import streamable_http_client
from mcp.shared.auth import OAuthClientInformationFull, OAuthClientMetadata, OAuthToken
from openai import OpenAI
from pydantic import AnyUrl


# 1. Load environment variables and configure OpenRouter
load_dotenv()


class InMemoryOAuthStorage(TokenStorage):
    """Store OAuth tokens and client registration for this run."""

    def __init__(self) -> None:
        self.tokens: OAuthToken | None = None
        self.client_info: OAuthClientInformationFull | None = None

    async def get_tokens(self) -> OAuthToken | None:
        return self.tokens

    async def set_tokens(self, tokens: OAuthToken) -> None:
        self.tokens = tokens

    async def get_client_info(self) -> OAuthClientInformationFull | None:
        return self.client_info

    async def set_client_info(self, client_info: OAuthClientInformationFull) -> None:
        self.client_info = client_info


async def open_authorization_url(url: str) -> None:
    print("\nOpening WorkOS sign-in in your browser...")
    print("If the browser cannot load the localhost callback afterward, copy its full URL from the address bar.")
    webbrowser.open(url)


async def receive_authorization_callback() -> AuthorizationCodeResult:
    callback_url = input(
        "\nAfter signing in, paste the full callback URL from your browser here: "
    ).strip()
    parsed = urlparse(callback_url)
    params = parse_qs(parsed.query)

    if "error" in params:
        description = params.get("error_description", params["error"])[0]
        raise RuntimeError(f"OAuth authorization failed: {description}")
    if "code" not in params or "state" not in params:
        raise RuntimeError(
            "The callback URL must contain both 'code' and 'state'. "
            "Copy the complete URL from the browser address bar."
        )

    return AuthorizationCodeResult(
        code=params["code"][0],
        state=params["state"][0],
        iss=params.get("iss", [None])[0],
    )


def build_oauth_provider() -> OAuthClientProvider:
    # The SDK discovers the protected-resource metadata from the MCP server.
    return OAuthClientProvider(
        server_url="http://localhost:8000",
        client_metadata=OAuthClientMetadata(
            client_name="KK Store Python Agent",
            redirect_uris=[AnyUrl("http://localhost:3030/callback")],
            grant_types=["authorization_code", "refresh_token"],
            response_types=["code"],
            scope="openid profile email offline_access",
        ),
        storage=InMemoryOAuthStorage(),
        redirect_handler=open_authorization_url,
        callback_handler=receive_authorization_callback,
    )

api_key = os.getenv("OPENROUTER_API_KEY")
openrouter_client = (
    OpenAI(
        base_url="https://openrouter.ai/api/v1",
        api_key=api_key,
    )
    if api_key
    else None
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

    # 3. Connect to our MCP server with WorkOS OAuth
    oauth_auth = build_oauth_provider()
    async with httpx2.AsyncClient(
        auth=oauth_auth,
        timeout=httpx2.Timeout(30.0, read=300.0),
    ) as http_client:
        async with streamable_http_client(
            "http://localhost:8000/mcp",
            http_client=http_client,
        ) as (read, write):
            async with Client((read, write)) as client:

                # Discover the tools exposed by the server
                result = await client.list_tools()
                print([tool.name for tool in result.tools])

                # Convert them into the format OpenRouter expects
                llm_tools = convert_mcp_tools(result.tools)

                if openrouter_client is None:
                    print(
                        "OAuth authentication succeeded and MCP tools are available. "
                        "Set OPENROUTER_API_KEY in .env to enable the LLM shopping agent."
                    )
                    return


                # 4. Keep track of the conversation
                
                messages = [
                    {
                        "role": "system",
                        "content": (
                            "You are the KK Store shopping assistant. "
                            "Use search_products to find products when needed. "
                            "Call get_product_details only when you have a product ID "
                            "obtained from tool results or reliable conversation context. "
                            "Never invent or guess product IDs. "
                            "If a search returns no matching products, explain that no "
                            "matching products were found instead of calling "
                            "get_product_details without a valid ID. "
                            "If the available information is insufficient, ask the user "
                            "for clarification rather than guessing."
                            "When a tool returns an error, do not treat the error as successful product data. Explain the issue accurately, do not invent missing information, and do not repeatedly retry the same failing request without a reason."
                        ),
                    },
                    {
                        "role": "user",
                        "content": "Find a product by searching for 'ring', then get its full details using get_product_details."
                    },
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
                            
                            tool_result = await client.call_tool(tool_name, arguments)

                           
                            if tool_result.is_error:
                                result_content = {
                                    "error": True,
                                    "error_type": "tool_execution_error",
                                    "message": "The tool could not complete the request.",
                                }
                            else:
                                try:
                                    if tool_result.structured_content is not None:
                                        data = tool_result.structured_content
                                    else:
                                        data = json.loads(tool_result.content[0].text)

                                    # Preserve errors returned by the tool itself.
                                    if isinstance(data, dict) and data.get("error") is True:
                                        result_content = data
                                    else:
                                        result_content = {
                                            "error": False,
                                            "data": data,
                                        }

                                except (
                                    json.JSONDecodeError,
                                    IndexError,
                                    AttributeError,
                                    TypeError,
                                ) as exc:
                                    print(f"Response parsing error: {exc}")
                                    result_content = {
                                        "error": True,
                                        "error_type": "invalid_tool_response",
                                        "message": "The tool returned an invalid or unexpected response format.",
                                    }


                         

                        except Exception as exc:
                            print(f"MCP tool call or transport error: {exc}")

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
                    print("Maximum tool-call rounds reached.")

                    final_response = openrouter_client.chat.completions.create(
                        model="openrouter/free",
                        messages=messages + [{
                            "role": "user",
                            "content": (
                                "You have reached the tool-call limit. "
                                "Give the best answer you can using the information "
                                "already available in this conversation. "
                                "Do not claim you performed actions you did not perform, "
                                "and mention any uncertainty or missing information."
                            ),
                        }],
                    )

                    print("Final answer:", final_response.choices[0].message.content)




if __name__ == "__main__":
    anyio.run(main)
