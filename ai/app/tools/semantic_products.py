from sentence_transformers import SentenceTransformer
from qdrant_client import QdrantClient
from qdrant_client.models import (
    Filter,
    FieldCondition,
    Range,
    MatchValue,
)
import httpx

from app.schemas.product import ProductSearchItem


MODEL_NAME = "all-MiniLM-L6-v2"
COLLECTION_NAME = "kkstore_products"

model = SentenceTransformer(MODEL_NAME)

qdrant = QdrantClient(
    url="http://localhost:6333"
)

BACKEND_URL = "http://localhost:5000"


async def hydrate_candidates(candidates):
    """
    Fetch the latest product data from PostgreSQL-backed Node API.

    Qdrant gives us candidate IDs.
    PostgreSQL gives us the current source-of-truth data.
    """

    hydrated_products = []

    async with httpx.AsyncClient() as http:
        for candidate in candidates:

            product_id = candidate["product_id"]

            try:
                response = await http.get(
                    f"{BACKEND_URL}/api/v1/products/{product_id}"
                )

                if response.status_code == 404:
                    continue

                response.raise_for_status()

                product = response.json()["data"]

                hydrated_products.append(
                    {
                        "product": product,
                        "score": candidate["score"],
                    }
                )

            except httpx.HTTPError as error:
                print(
                    f"Failed to fetch product "
                    f"{product_id}: {error}"
                )

    return hydrated_products


async def semantic_search_products(
    query: str,
    max_price: float | None = None,
    waterproof: bool | None = None,
    limit: int = 5,
):
    """
    Search KK Store products semantically using Qdrant.

    Returns candidate product IDs and similarity scores.
    PostgreSQL remains the source of truth for final product data.
    """

    query_vector = model.encode(query).tolist()

    conditions = [
        FieldCondition(
            key="stock",
            range=Range(gt=0),
        )
    ]

    if max_price is not None:
        conditions.append(
            FieldCondition(
                key="price",
                range=Range(lte=max_price),
            )
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
        limit=limit,
        with_payload=True,
        with_vectors=False,
    )

    candidates = []

    for point in result.points:
        candidates.append(
            {
                "product_id": point.payload["product_id"],
                "score": point.score,
            }
        )

    return {
        "query": query,
        "candidates": candidates,
    }


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

    hydrated = await hydrate_candidates(
        search_result["candidates"]
    )

    results = []

    for item in hydrated:
        product = item["product"]

        product_result = ProductSearchItem(
            id=product["id"],
            name=product["name"],
            category=product["category"]["name"],
            price=float(
                min(
                    variant["price"]
                    for variant in product["variants"]
                )
            ),
            stock=sum(
                variant["stock"]
                for variant in product["variants"]
            ),
            image_url=(
                product["images"][0]["imageUrl"]
                if product.get("images")
                else None
            ),
        )

        results.append(
    {
        "id": product["id"],
        "name": product["name"],
        "category": product["category"]["name"],
        "price": float(
            min(
                variant["price"]
                for variant in product["variants"]
            )
        ),
        "stock": sum(
            variant["stock"]
            for variant in product["variants"]
        ),
        "image_url": (
            product["images"][0]["imageUrl"]
            if product.get("images")
            else None
        ),
        "score": item["score"],
    }
)

    return results