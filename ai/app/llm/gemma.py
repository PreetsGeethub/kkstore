import os

from dotenv import load_dotenv
from google import genai
from google.genai import types

from app.tools.product_tool import search_products_tool


load_dotenv()


MODEL_NAME = "gemini-3.5-flash-lite"


client = genai.Client(
    api_key=os.getenv("GEMINI_API_KEY")
)


def get_gemma_tools():
    return types.Tool(
        function_declarations=[
            types.FunctionDeclaration(
                name=search_products_tool["name"],
                description=search_products_tool["description"],
                parameters=search_products_tool["parameters"],
            )
        ]
    )


SYSTEM_PROMPT = """
You are the AI shopping assistant for KK Store.

Use the provided tools to obtain KK Store product information.

The tool results are the only source of truth for:
- products
- prices
- colors
- stock
- availability

Never invent products, prices, stock, colors, or product details.

Never recommend products from external stores.

If the tool returns no matching products, clearly tell the customer that
no matching products were found in the KK Store catalog.
"""


def ask_gemma(prompt):

    response = client.models.generate_content(
        model=MODEL_NAME,
        contents=prompt,
        config=types.GenerateContentConfig(
            system_instruction=SYSTEM_PROMPT,
            tools=[get_gemma_tools()],
            temperature=0.7,
        ),
    )

    return response