from dotenv import load_dotenv

load_dotenv()
import os
from openai import OpenAI

api_key = os.getenv("OPENROUTER_API_KEY")

if not api_key:
    raise RuntimeError("OPENROUTER_API_KEY is not set")

client = OpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key=api_key,
)

response = client.chat.completions.create(
    model="openrouter/free",
    messages=[
        {"role": "user", "content": "What is 3 + 5? Reply briefly."}
    ],
)

print(response.choices[0].message.content)