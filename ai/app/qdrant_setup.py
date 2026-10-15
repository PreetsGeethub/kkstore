from qdrant_client import QdrantClient
from qdrant_client.models import Distance, VectorParams

from app.config import QDRANT_API_KEY, QDRANT_URL

client = QdrantClient(url=QDRANT_URL, api_key=QDRANT_API_KEY or None)
COLLECTION_NAME = "kkstore_products"


def ensure_collection():
    existing = {
        collection.name
        for collection in client.get_collections().collections
    }
    if COLLECTION_NAME not in existing:
        client.create_collection(
            collection_name=COLLECTION_NAME,
            vectors_config=VectorParams(
                size=384,
                distance=Distance.COSINE,
            ),
        )
        print(f"Created collection '{COLLECTION_NAME}'.")
    else:
        print(f"Collection '{COLLECTION_NAME}' already exists.")


if __name__ == "__main__":
    ensure_collection()
