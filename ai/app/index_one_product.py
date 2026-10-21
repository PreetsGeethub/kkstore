from sentence_transformers import SentenceTransformer
from qdrant_client import QdrantClient
from qdrant_client.models import PointStruct

# 1. Embedding model
model = SentenceTransformer("all-MiniLM-L6-v2")

# 2. Connect to Qdrant
client = QdrantClient(url="http://localhost:6333")

COLLECTION_NAME = "kkstore_products"

# 3. One real KK Store product
product = {
    "id": "cmuf46b930000v8um81bs4qfj",
    "name": "Ring",
    "category": "treatfab",
    "price": 1400.0,
    "stock": 2,
    "image_url": "https://res.cloudinary.com/dxu5jkdwy/image/upload/v1790229068/kk-store/wgtf4mz2g7xvlhpjm0og.png",
}

# 4. Text that we want the embedding model to understand
product_text = f"""
Product: {product["name"]}
Category: {product["category"]}
Price: {product["price"]}
"""

# 5. Convert product text -> 384-dimensional vector
embedding = model.encode(product_text).tolist()

# 6. Store it in Qdrant
client.upsert(
    collection_name=COLLECTION_NAME,
    points=[
        PointStruct(
            id=1,
            vector=embedding,
            payload=product,
        )
    ],
)

print("Product indexed successfully!")
print("Vector dimensions:", len(embedding))