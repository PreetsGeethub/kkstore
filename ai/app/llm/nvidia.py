import os

from dotenv import load_dotenv
from openai import OpenAI
from app.tools.product_tool import search_products_tool

load_dotenv()

MODEL_NAME = "nvidia/nemotron-3.5-lightning-30b-a3b"
def get_nvidia_tools():
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
    
client = OpenAI(
    base_url="https://integrate.api.nvidia.com/v1",
    api_key=os.getenv("NVIDIA_API_KEY"),
)


def ask_nvidia(prompt: str):
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
    }
    ],
    tools=get_nvidia_tools(),
    tool_choice="required",
    temperature=0.6,
    max_tokens=512,
    extra_body={
        "chat_template_kwargs": {
            "enable_thinking": False
        }
    },
    )

    return response

def continue_nvidia_conversation(messages):
    response = client.chat.completions.create(
        model=MODEL_NAME,
        messages=messages,
        max_tokens=512,
        temperature=0.6,
        extra_body={
            "chat_template_kwargs": {
                "enable_thinking": False,
            }
        },
    )

    return response