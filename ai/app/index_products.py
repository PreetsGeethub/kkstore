import asyncio
import uuid

import httpx
from qdrant_client import QdrantClient
from qdrant_client.models import PointStruct

from app.config import BACKEND_URL, HTTP_TIMEOUT_SECONDS, QDRANT_API_KEY, QDRANT_URL
from app.embeddings import model
from app.qdrant_setup import ensure_collection

COLLECTION_NAME = "kkstore_products"
client = QdrantClient(url=QDRANT_URL, api_key=QDRANT_API_KEY or None)


async def fetch_product_list(http):
    products = []
    page = 1

    while True:
        response = await http.get(
            f"{BACKEND_URL}/api/v1/products",
            params={"page": page, "limit": 100, "status": "active"},
        )
        response.raise_for_status()
        batch = response.json()["data"]["products"]
        products.extend(batch)

        if len(batch) < 100:
            break
        page += 1

    return products


async def fetch_product_details(http, product_id):
    response = await http.get(f"{BACKEND_URL}/api/v1/products/{product_id}")
    response.raise_for_status()
    return response.json()["data"]


def build_product_text(product):
    category = product.get("category") or {}
    variants = product.get("variants") or []
    variants_text = "\n".join(
        f"Color: {variant.get('color', '')}, Size: {variant.get('size', '')}"
        for variant in variants
    )

    return f"""
Product: {product.get('name', '')}
Category: {category.get('name', '')}
Description: {product.get('description', '')}
Material: {product.get('material', '')}
Care Instructions: {product.get('careInstructions', '')}
Anti Tarnish: {product.get('isAntiTarnish', False)}
Waterproof: {product.get('isWaterproof', False)}
Skin Friendly: {product.get('isSkinFriendly', False)}

Variants:
{variants_text}
""".strip()


async def main():
    ensure_collection()

    async with httpx.AsyncClient(timeout=HTTP_TIMEOUT_SECONDS) as http:
        products = await fetch_product_list(http)
        print(f"Found {len(products)} products.")
        points = []

        for product_summary in products:
            product = await fetch_product_details(http, product_summary["id"])
            variants = product.get("variants") or []
            if not variants:
                print(f"Skipped product without variants: {product.get('id')}")
                continue

            product_text = build_product_text(product)
            images = product.get("images") or []
            point_id = str(uuid.uuid5(uuid.NAMESPACE_URL, product["id"]))

            points.append(
                PointStruct(
                    id=point_id,
                    vector=model.encode(product_text).tolist(),
                    payload={
                        "product_id": product["id"],
                        "name": product["name"],
                        "category": product["category"]["name"],
                        "price": float(min(v["price"] for v in variants)),
                        "stock": sum(v["stock"] for v in variants),
                        "is_waterproof": product.get("isWaterproof", False),
                        "is_anti_tarnish": product.get("isAntiTarnish", False),
                        "is_skin_friendly": product.get("isSkinFriendly", False),
                        "thumbnail": images[0]["imageUrl"] if images else None,
                        "source": "postgresql",
                        "source_updated_at": product.get("updatedAt"),
                    },
                )
            )
            print(f"Prepared: {product['name']}")

    if points:
        client.upsert(collection_name=COLLECTION_NAME, points=points)

    print(f"Indexed {len(points)} products successfully.")


if __name__ == "__main__":
    asyncio.run(main())
