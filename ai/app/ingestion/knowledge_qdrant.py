from qdrant_client import QdrantClient
from qdrant_client.models import Distance, VectorParams
from app.ingestion.knowledge_embeddings import embed_text
from uuid import uuid5, NAMESPACE_URL
import hashlib
COLLECTION_NAME = "kkstore_knowledge"

qdrant = QdrantClient(url="http://localhost:6333")

from pathlib import Path

knowledge_dir = Path("knowledge")
def insert_chunk(chunk: dict):
    point_id = str(
        uuid5(
            NAMESPACE_URL,
            f"{chunk['source']}:{chunk['chunk_id']}",
        )
    )

    new_hash = content_hash(chunk["text"])
    old_hash = get_existing_hash(point_id)

    if old_hash == new_hash:
        print(f"Skipped unchanged: {chunk['section']}")
        return

    vector = embed_text(chunk["text"])

    chunk["content_hash"] = new_hash

    qdrant.upsert(
        collection_name=COLLECTION_NAME,
        points=[
            {
                "id": point_id,
                "vector": vector,
                "payload": chunk,
            }
        ],
    )

    if old_hash is None:
        print(f"Inserted: {chunk['section']}")
    else:
        print(f"Updated: {chunk['section']}")
        

    
def content_hash(text: str) -> str:
    return hashlib.sha256(
        text.encode("utf-8")
    ).hexdigest()


def create_collection():
    existing = [collection.name for collection in qdrant.get_collections().collections]

    if COLLECTION_NAME not in existing:
        qdrant.create_collection(
            collection_name=COLLECTION_NAME,
            vectors_config=VectorParams(
                size=384,
                distance=Distance.COSINE,
            ),
        )
        print(f"Created collection: {COLLECTION_NAME}")
    else:
        print(f"Collection already exists: {COLLECTION_NAME}")

def search_knowledge(query: str):
    vector = embed_text(query)

    results = qdrant.query_points(
        collection_name=COLLECTION_NAME,
        query=vector,
        limit=3,
        with_payload=True,
    )

    for result in results.points:
        print("Score:", result.score)
        print("Payload:", result.payload)
        print("-" * 50)
        
        
from app.ingestion.markdown_ingestion import (
    load_markdown,
    chunk_by_headers,
)

def get_existing_hash(point_id: str) -> str | None:
    points = qdrant.retrieve(
        collection_name=COLLECTION_NAME,
        ids=[point_id],
        with_payload=True,
    )

    if not points:
        return None

    return points[0].payload.get("content_hash")

def get_existing_point_ids():
    points, _ = qdrant.scroll(
        collection_name=COLLECTION_NAME,
        limit=100,
        with_payload=False,
        with_vectors=False,
    )

    return {str(point.id) for point in points}

def get_point_id(chunk: dict) -> str:
    return str(
        uuid5(
            NAMESPACE_URL,
            f"{chunk['source']}:{chunk['chunk_id']}",
        )
    )
if __name__ == "__main__":
    create_collection()

    seen_point_ids = set()

    # 1. Process all current source files
    for file_path in knowledge_dir.glob("*.md"):
        print(f"Processing: {file_path}")

        text = load_markdown(file_path)

        chunks = chunk_by_headers(
            text,
            file_path.name
        )

        for chunk in chunks:
            seen_point_ids.add(get_point_id(chunk))
            insert_chunk(chunk)

        print(f"Found {len(chunks)} chunks")

    # 2. Get everything currently in Qdrant
    existing_point_ids = get_existing_point_ids()

    # 3. Find things that are in Qdrant but no longer in source
    stale_point_ids = existing_point_ids - seen_point_ids

    # 4. Delete stale chunks
    if stale_point_ids:
        qdrant.delete(
            collection_name=COLLECTION_NAME,
            points_selector=list(stale_point_ids),
        )

        for point_id in stale_point_ids:
            print(f"Deleted stale chunk: {point_id}")

    print(f"Indexed {len(seen_point_ids)} chunks")