
from app.rag.retrieval import retrieve_knowledge
from app.rag.reranker import rerank
def evaluate_retrieval_confidence():
    queries = [
        # Known
        "How long does delivery usually take?",
        "How do I make a warranty claim?",
        "How are approved returns refunded?",

        # Unknown
        "Do you offer international shipping?",
        "Can I pay cash on delivery?",
        "Do you offer same-day delivery?",
    ]

    print("\n=== RETRIEVAL CONFIDENCE BASELINE ===")

    for query in queries:
        results = retrieve_knowledge(query, limit=3)

        print(f"\nQuery: {query}")

        results = retrieve_knowledge(query, limit=10)
        reranked = rerank(query, results, top_k=3)

        for result in reranked:
            print(
                result.section,
                "dense=", round(result.score, 4),
                "reranker=", round(result.reranker_score, 4),
            )

if __name__ == "__main__":
    evaluate_retrieval_confidence()