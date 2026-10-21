import hashlib
from pathlib import Path
from uuid import NAMESPACE_URL, uuid5

from qdrant_client import QdrantClient
from qdrant_client.models import Distance, PointStruct, VectorParams

from app.config import QDRANT_API_KEY, QDRANT_URL
from app.ingestion.knowledge_embeddings import embed_text
from app.ingestion.markdown_ingestion import load_markdown, chunk_by_headers

COLLECTION_NAME = "kkstore_knowledge"
qdrant = QdrantClient(url=QDRANT_URL, api_key=QDRANT_API_KEY or None)
knowledge_dir = Path(__file__).resolve().parents[2] / "knowledge"


def content_hash(text: str) -> str:
    return hashlib.sha256(text.encode("utf-8")).hexdigest()


def get_point_id(chunk: dict) -> str:
    return str(
        uuid5(
            NAMESPACE_URL,
            f"{chunk['source']}:{chunk['chunk_id']}",
        )
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


def insert_chunk(chunk: dict):
    point_id = get_point_id(chunk)
    new_hash = content_hash(chunk["text"])
    old_hash = get_existing_hash(point_id)

    if old_hash == new_hash:
        print(f"Skipped unchanged: {chunk['section']}")
        return

    payload = {**chunk, "content_hash": new_hash}
    qdrant.upsert(
        collection_name=COLLECTION_NAME,
        points=[
            PointStruct(
                id=point_id,
                vector=embed_text(chunk["text"]),
                payload=payload,
            )
        ],
    )
    print(
        f"{'Inserted' if old_hash is None else 'Updated'}: "
        f"{chunk['section']}"
    )


def create_collection():
    existing = {
        collection.name
        for collection in qdrant.get_collections().collections
    }
    if COLLECTION_NAME not in existing:
        qdrant.create_collection(
            collection_name=COLLECTION_NAME,
            vectors_config=VectorParams(size=384, distance=Distance.COSINE),
        )
        print(f"Created collection: {COLLECTION_NAME}")


def get_existing_point_ids() -> set[str]:
    point_ids: set[str] = set()
    offset = None

    while True:
        points, offset = qdrant.scroll(
            collection_name=COLLECTION_NAME,
            limit=100,
            offset=offset,
            with_payload=False,
            with_vectors=False,
        )
        point_ids.update(str(point.id) for point in points)
        if offset is None:
            return point_ids


def search_knowledge(query: str):
    results = qdrant.query_points(
        collection_name=COLLECTION_NAME,
        query=embed_text(query),
        limit=3,
        with_payload=True,
    )
    return results.points


def main():
    create_collection()
    seen_point_ids = set()

    for file_path in knowledge_dir.glob("*.md"):
        print(f"Processing: {file_path.name}")
        chunks = chunk_by_headers(load_markdown(file_path), file_path.name)
        for chunk in chunks:
            seen_point_ids.add(get_point_id(chunk))
            insert_chunk(chunk)
        print(f"Found {len(chunks)} chunks")

    stale_point_ids = get_existing_point_ids() - seen_point_ids
    if stale_point_ids:
        qdrant.delete(
            collection_name=COLLECTION_NAME,
            points_selector=list(stale_point_ids),
        )
        print(f"Deleted {len(stale_point_ids)} stale knowledge chunks")

    print(f"Indexed {len(seen_point_ids)} knowledge chunks")


if __name__ == "__main__":
    main()
