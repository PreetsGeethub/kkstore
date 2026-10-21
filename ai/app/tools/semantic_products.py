import logging

import httpx
from qdrant_client import QdrantClient
from qdrant_client.models import Filter, FieldCondition, MatchValue, Range

from app.config import BACKEND_URL, HTTP_TIMEOUT_SECONDS, QDRANT_API_KEY, QDRANT_URL
from app.embeddings import model

logger = logging.getLogger(__name__)

COLLECTION_NAME = "kkstore_products"
qdrant = QdrantClient(url=QDRANT_URL, api_key=QDRANT_API_KEY or None)


async def hydrate_candidates(candidates):
    """Hydrate Qdrant candidate IDs from the Node API source of truth."""
    hydrated_products = []

    async with httpx.AsyncClient(timeout=HTTP_TIMEOUT_SECONDS) as http:
        for candidate in candidates:
            product_id = candidate["product_id"]

            try:
                response = await http.get(
                    f"{BACKEND_URL}/api/v1/products/{product_id}"
                )
                if response.status_code == 404:
                    continue

                response.raise_for_status()
                hydrated_products.append(
                    {
                        "product": response.json()["data"],
                        "score": candidate["score"],
                    }
                )
            except httpx.HTTPError:
                logger.warning(
                    "Failed to hydrate semantic-search candidate %s",
                    product_id,
                    exc_info=True,
                )

    return hydrated_products


async def semantic_search_products(
    query: str,
    max_price: float | None = None,
    waterproof: bool | None = None,
    limit: int = 5,
):
    """Find candidate product IDs; current product details come from Node."""
    query_vector = model.encode(query).tolist()
    conditions = [
        FieldCondition(key="stock", range=Range(gt=0)),
    ]

    if max_price is not None:
        conditions.append(
            FieldCondition(key="price", range=Range(lte=max_price))
        )
    if waterproof is not None:
        conditions.append(
            FieldCondition(
                key="is_waterproof",
                match=MatchValue(value=waterproof),
            )
        )

    result = qdrant.query_points(
        collection_name=COLLECTION_NAME,
        query=query_vector,
        query_filter=Filter(must=conditions),
        limit=max(1, min(limit, 20)),
        with_payload=True,
        with_vectors=False,
    )

    candidates = [
        {
            "product_id": point.payload["product_id"],
            "score": point.score,
        }
        for point in result.points
        if point.payload and point.payload.get("product_id")
    ]

    return {"query": query, "candidates": candidates}


async def semantic_product_search(
    query: str,
    max_price: float | None = None,
    waterproof: bool | None = None,
    limit: int = 5,
):
    search_result = await semantic_search_products(
        query=query,
        max_price=max_price,
        waterproof=waterproof,
        limit=limit,
    )
    hydrated = await hydrate_candidates(search_result["candidates"])

    results = []
    for item in hydrated:
        product = item["product"]
        variants = product.get("variants") or []
        if not variants:
            continue

        images = product.get("images") or []
        results.append(
            {
                "id": product["id"],
                "name": product["name"],
                "category": product["category"]["name"],
                "price": float(min(variant["price"] for variant in variants)),
                "stock": sum(variant["stock"] for variant in variants),
                "image_url": images[0]["imageUrl"] if images else None,
                "score": item["score"],
            }
        )

    return results
