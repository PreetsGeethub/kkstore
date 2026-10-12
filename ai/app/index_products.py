import asyncio
import uuid

import httpx
from sentence_transformers import SentenceTransformer
from qdrant_client import QdrantClient
from qdrant_client.models import PointStruct


BACKEND_URL = "http://localhost:5000"
COLLECTION_NAME = "kkstore_products"

model = SentenceTransformer("all-MiniLM-L6-v2")
client = QdrantClient(url="http://localhost:6333")


async def fetch_product_list(http):
    response = await http.get(
        f"{BACKEND_URL}/api/v1/products",
        params={
            "page": 1,
            "limit": 100,
            "status": "active",
        },
    )

    response.raise_for_status()

    return response.json()["data"]["products"]


async def fetch_product_details(http, product_id):
    response = await http.get(
        f"{BACKEND_URL}/api/v1/products/{product_id}"
    )

    response.raise_for_status()

    return response.json()["data"]


def build_product_text(product):
    category = product.get("category") or {}

    variants = product.get("variants") or []

    variants_text = "\n".join(
        f"Color: {variant.get('color', '')}, "
        f"Size: {variant.get('size', '')}"
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
    async with httpx.AsyncClient() as http:
        products = await fetch_product_list(http)

        print(f"Found {len(products)} products.")

        points = []

        for product_summary in products:
            product_id = product_summary["id"]

            product = await fetch_product_details(
                http,
                product_id,
            )

            product_text = build_product_text(product)

            embedding = model.encode(
                product_text
            ).tolist()

            point_id = str(
                uuid.uuid5(
                    uuid.NAMESPACE_URL,
                    product_id,
                )
            )

            points.append(
                PointStruct(
                    id=point_id,
                    vector=embedding,
                    payload={
                        "product_id": product_id,
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
                        "is_waterproof": product.get(
                            "isWaterproof",
                            False,
                        ),
                        "is_anti_tarnish": product.get(
                            "isAntiTarnish",
                            False,
                        ),
                        "is_skin_friendly": product.get(
                            "isSkinFriendly",
                            False,
                        ),
                        "thumbnail": (
                            product["images"][0]["imageUrl"]
                            if product.get("images")
                            else None
                        ),
                            # Metadata
                            "source": "postgresql",
                            "source_updated_at": product.get("updatedAt"),
                    },
                )
            )

            print(f"Prepared: {product['name']}")

    client.upsert(
        collection_name=COLLECTION_NAME,
        points=points,
    )

    print(f"\nIndexed {len(points)} products successfully.")


if __name__ == "__main__":
    asyncio.run(main())