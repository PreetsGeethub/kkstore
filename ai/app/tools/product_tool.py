search_products_tool = {
    "type": "function",
    "name": "search_products",
    "description": (
    "Searches the KK Store product catalog. "
    "Use query for the core product type or name, "
    "and use max_price and color for their respective filters."
),
    "parameters": {
        "type": "object",
        "properties": {
            "query": {
                "type": "string",
                "description": (
    "The core product name or product type to search for. "
    "Do not include color, price, or other filters in this value "
    "when those filters have their own parameters."
)
            },
            "max_price": {
                "type": "number",
                "description": "The maximum price the customer is willing to pay."
            },
            "color": {
                "type": "string",
                "description": "The color of the product the customer is looking for."
            }
        },
        "required": ["query"]
    }
}

get_product_details_tool = {
    "type": "function",
    "name": "get_product_details",
    "description": (
        "Gets the complete details of a specific KK Store product. "
        "Use this when the customer wants more information about a product "
        "that has already been identified."
    ),
    "parameters": {
        "type": "object",
        "properties": {
            "product_id": {
                "type": "string",
                "description": (
                    "The unique ID of the KK Store product."
                )
            }
        },
        "required": ["product_id"]
    }
}