from sentence_transformers import SentenceTransformer
from qdrant_client import QdrantClient
from qdrant_client.models import (
    Filter,
    FieldCondition,
    Range,
    MatchValue,
)

model = SentenceTransformer("all-MiniLM-L6-v2")

client = QdrantClient(url="http://localhost:6333")

COLLECTION_NAME = "kkstore_products"

query = "elegant jewellery"

query_vector = model.encode(query).tolist()

results = client.query_points(
    collection_name=COLLECTION_NAME,
    query=query_vector,
    query_filter=Filter(
        must=[
            FieldCondition(
                key="price",
                range=Range(lte=1500),
            ),
            FieldCondition(
                key="stock",
                range=Range(gt=0),
            ),
            FieldCondition(
                key="is_waterproof",
                match=MatchValue(value=True),
            ),
        ]
    ),
    limit=5,
)

for point in results.points:
    print(
        f"Score: {point.score:.4f} | "
        f"Product: {point.payload['name']} | "
        f"Price: ₹{point.payload['price']} | "
        f"Stock: {point.payload['stock']} | "
        f"Waterproof: {point.payload['is_waterproof']}"
    )