from app.tools.product_tool import (
    search_products_tool,
    get_product_details_tool,
)
from app.tools.semantic_product_tool import (
    semantic_product_search_tool,
)
from app.tools.knowledge_tool import (
    knowledge_search_tool,
)
from app.tools.order_tool import (
    get_my_orders_tool,
)


def get_ollama_tools():
    return [
        {
            "type": "function",
            "function": {
                "name": search_products_tool["name"],
                "description": search_products_tool["description"],
                "parameters": search_products_tool["parameters"],
            },
        },
        {
            "type": "function",
            "function": {
                "name": get_product_details_tool["name"],
                "description": get_product_details_tool["description"],
                "parameters": get_product_details_tool["parameters"],
            },
        },
        {
            "type": "function",
            "function": {
                "name": get_my_orders_tool["name"],
                "description": get_my_orders_tool["description"],
                "parameters": get_my_orders_tool["parameters"],
            },
        },
        {
            "type": "function",
            "function": {
                "name": semantic_product_search_tool["name"],
                "description": semantic_product_search_tool["description"],
                "parameters": semantic_product_search_tool["parameters"],
            },
        },
        {
            "type": "function",
            "function": {
                "name": knowledge_search_tool["name"],
                "description": knowledge_search_tool["description"],
                "parameters": knowledge_search_tool["parameters"],
            },
        },
    ]