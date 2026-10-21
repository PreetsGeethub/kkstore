from app.rag.schemas import RetrievalResult


def build_context(results: list[RetrievalResult]) -> str:
    context_parts = []

    for result in results:
        context_parts.append(
            "<document>\n"
            f"Source: {result.source}\n"
            f"Section: {result.section}\n"
            f"Content:\n{result.text}\n"
            "</document>"
        )

    return "\n\n".join(context_parts)