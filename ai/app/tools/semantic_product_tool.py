semantic_product_search_tool = {
    "name": "semantic_product_search",
    "description": (
        "Search KK Store jewellery/products by semantic meaning. "
        "Use this when the customer describes a product by style, "
        "occasion, use case, appearance, or natural-language intent. "
        "Preserve the actual product type mentioned by the customer. "
        "Do not invent unrelated product types such as dresses, shoes, "
        "or clothing. Use max_price and waterproof as hard constraints "
        "when the customer provides them."
    ),
    "parameters": {
        "type": "object",
        "properties": {
            "query": {
                "type": "string",
                "description": (
                    "Core semantic product request. Preserve the actual "
                    "product/category words from the customer's request, "
                    "along with meaningful style, occasion, or use-case terms."
                ),
            },
            "max_price": {
                "type": "number",
                "description": "Maximum acceptable product price.",
            },
            "waterproof": {
                "type": "boolean",
                "description": "Whether the product must be waterproof.",
            },
            "limit": {
                "type": "integer",
                "description": "Maximum number of candidate products to return.",
                "default": 5,
            },
        },
        "required": ["query"],
    },
}