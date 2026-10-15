from app.embeddings import embed_text

if __name__ == "__main__":
    text = "Customers can request a return within 7 days of delivery."
    vector = embed_text(text)
    print("Vector dimensions:", len(vector))
    print("First 5 values:", vector[:5])
