
def filter_semantic_products(products, max_price=None):
    if max_price is None:
        return products

    return [
        product
        for product in products
        if float(product.get("price", float("inf"))) <= max_price
    ]


def test_semantic_results_respect_max_price():
    products = [
        {"id": "p1", "name": "Ring", "price": 1400},
        {"id": "p2", "name": "Pendant", "price": 6200},
    ]

    filtered = filter_semantic_products(products, max_price=5000)

    assert [product["id"] for product in filtered] == ["p1"]


def test_semantic_results_without_price_limit_are_preserved():
    products = [
        {"id": "p1", "name": "Ring", "price": 1400},
        {"id": "p2", "name": "Pendant", "price": 6200},
    ]

    assert filter_semantic_products(products) == products
