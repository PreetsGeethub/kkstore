from sentence_transformers import SentenceTransformer

MODEL_NAME = "all-MiniLM-L6-v2"

model = SentenceTransformer(MODEL_NAME)


def embed_text(text: str) -> list[float]:
    vector = model.encode(text).tolist()
    return vector


if __name__ == "__main__":
    text = "Customers can request a return within 7 days of delivery."

    vector = embed_text(text)

    print("Vector dimensions:", len(vector))
    print("First 5 values:", vector[:5])