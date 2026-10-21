from app.ingestion.markdown_ingestion import (
    load_markdown,
    chunk_by_headers,
)


def index_knowledge_document(file_path: str):
    text = load_markdown(file_path)

    chunks = chunk_by_headers(text, file_path)

    return chunks

if __name__ == "__main__":
    chunks = index_knowledge_document(
        "knowledge/return_policy.md"
    )

    for chunk in chunks:
        print(chunk)
        print("-" * 50)