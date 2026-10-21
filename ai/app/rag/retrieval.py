from qdrant_client import QdrantClient
from qdrant_client.models import Filter, FieldCondition, MatchValue

from app.config import QDRANT_API_KEY, QDRANT_URL
from app.embeddings import model
from app.rag.schemas import RetrievalResult

COLLECTION_NAME = "kkstore_knowledge"
qdrant = QdrantClient(url=QDRANT_URL, api_key=QDRANT_API_KEY or None)


def retrieve_knowledge(
    query: str,
    limit: int = 10,
    source: str | None = None,
) -> list[RetrievalResult]:
    query_vector = model.encode(query).tolist()
    query_filter = None

    if source:
        query_filter = Filter(
            must=[
                FieldCondition(
                    key="source",
                    match=MatchValue(value=source),
                )
            ]
        )

    results = qdrant.query_points(
        collection_name=COLLECTION_NAME,
        query=query_vector,
        query_filter=query_filter,
        limit=max(1, min(limit, 20)),
    ).points

    return [
        RetrievalResult(
            chunk_id=point.payload["chunk_id"],
            source=point.payload["source"],
            section=point.payload["section"],
            text=point.payload["text"],
            score=point.score,
        )
        for point in results
        if point.payload
        and all(key in point.payload for key in ("chunk_id", "source", "section", "text"))
    ]
