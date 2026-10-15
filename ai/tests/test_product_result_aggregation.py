
from app.agents.shopping_agent import _add_products


def test_add_products_deduplicates_by_product_id():
    results = [
        {"id": "p1", "name": "Ring", "price": 1400},
    ]

    _add_products(
        results,
        [
            {"id": "p1", "name": "Ring", "price": 1400, "score": 0.95},
            {"id": "p2", "name": "Pendant", "price": 1299, "score": 0.82},
        ],
    )

    assert [product["id"] for product in results] == ["p1", "p2"]
