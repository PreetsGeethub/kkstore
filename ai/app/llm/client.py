import ollama

MODEL_NAME = "qwen3:4b"


def ask_ollama(messages, tools=None):
    response = ollama.chat(
        model=MODEL_NAME,
        messages=messages,
        tools=tools,
        think=False,
    )

    return response