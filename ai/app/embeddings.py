from sentence_transformers import SentenceTransformer

model = SentenceTransformer("all-MiniLM-L6-v2")

text = "minimal rose gold ring for everyday wear"

embedding = model.encode(text)

print("Embedding type:", type(embedding))
print("Dimensions:", len(embedding))
print("First 5 values:", embedding[:5])