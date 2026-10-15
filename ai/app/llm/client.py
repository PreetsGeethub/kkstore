import ollama

from app.config import OLLAMA_BASE_URL, OLLAMA_MODEL

client = ollama.Client(host=OLLAMA_BASE_URL)


def ask_ollama(messages, tools=None):
    return client.chat(
        model=OLLAMA_MODEL,
        messages=messages,
        tools=tools,
        think=False,
    )
