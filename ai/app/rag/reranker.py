from sentence_transformers import CrossEncoder

from app.config import RERANKER_MODEL
from app.rag.schemas import RetrievalResult

model = CrossEncoder(RERANKER_MODEL)


def rerank(
    query: str,
    results: list[RetrievalResult],
    top_k: int = 3,
) -> list[RetrievalResult]:
    if not results:
        return []

    pairs = [(query, result.text) for result in results]
    scores = model.predict(pairs)

    ranked_results = [
        result.model_copy(
            update={"reranker_score": float(score)}
        )
        for result, score in zip(results, scores)
    ]

    ranked_results.sort(
        key=lambda result: result.reranker_score,
        reverse=True,
    )
    return ranked_results[:top_k]
