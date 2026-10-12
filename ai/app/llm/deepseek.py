import os

from dotenv import load_dotenv
from openai import OpenAI

from app.tools.product_tool import search_products_tool


load_dotenv()


MODEL_NAME = "deepseek-ai/deepseek-v4.1-flash"


client = OpenAI(
    base_url="https://integrate.api.nvidia.com/v1",
    api_key=os.getenv("NVIDIA_API_KEY"),
)


def get_deepseek_tools():
    return [
        {
            "type": "function",
            "function": {
                "name": search_products_tool["name"],
                "description": search_products_tool["description"],
                "parameters": search_products_tool["parameters"],
            },
        }
    ]


def ask_deepseek(prompt):
    response = client.chat.completions.create(
        model=MODEL_NAME,
        messages=[
            {
                "role": "system",
                "content": (
                    "You are the AI shopping assistant for KK Store. "
                    "Use the provided tools to obtain KK Store product information. "
                    "The tool results are the only source of truth for KK Store "
                    "products, prices, colors, stock, and availability. "
                    "Never invent products, prices, stock, or product details. "
                    "Never recommend products from external stores. "
                    "If a tool returns no products, clearly tell the customer "
                    "that no matching products were found in the KK Store catalog."
                ),
            },
            {
                "role": "user",
                "content": prompt,
            },
        ],
        tools=get_deepseek_tools(),
        tool_choice="auto",
        reasoning_effort="high",
        max_tokens=512,
    )

    return response


def continue_deepseek_conversation(messages):
    response = client.chat.completions.create(
        model=MODEL_NAME,
        messages=messages,
        tools=get_deepseek_tools(),
        tool_choice="auto",
        reasoning_effort="high",
        max_tokens=512,
    )

    return response