from sentence_transformers import CrossEncoder

from app.rag.schemas import RetrievalResult


MODEL_NAME = "cross-encoder/ms-marco-MiniLM-L-6-v2"

model = CrossEncoder(MODEL_NAME)


def rerank(
    query: str,
    results: list[RetrievalResult],
    top_k: int = 3,
) -> list[RetrievalResult]:

    pairs = [
        (query, result.text)
        for result in results
    ]

    scores = model.predict(pairs)

    ranked_results = []

    for result, score in zip(results, scores):
        ranked_results.append(
            result.model_copy(
                update={
                    "reranker_score": float(score)
                }
            )
        )

    ranked_results.sort(
        key=lambda result: result.reranker_score,
        reverse=True,
    )

    return ranked_results[:top_k]