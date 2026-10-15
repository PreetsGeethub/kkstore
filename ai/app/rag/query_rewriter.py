from app.llm.client import ask_llm


def rewrite_query(
    conversation_history: list[dict],
    latest_user_message: str,
    tool_query: str,
) -> str:
    recent_messages = [
        message
        for message in conversation_history
        if message.get("role") in ("user", "assistant")
        and isinstance(message.get("content"), str)
        and message["content"].strip()
    ][-6:]

    history_text = "\n".join(
        f"{message['role']}: {message['content']}"
        for message in recent_messages
    )

    if not history_text:
        history_text = "No previous conversation."

    messages = [
        {
            "role": "system",
            "content": (
                "You rewrite knowledge-base search queries for KK Store. "
                "Return one standalone search query, not an answer. "

                "The tool query identifies the knowledge the system "
                "needs to retrieve. Use the latest user message and "
                "conversation history to resolve references and recover "
                "relevant missing context or constraints. "

                "Rewrite only the knowledge-related question represented "
                "by the tool query. Do not mix unrelated product searches "
                "or other tasks into it. "

                "Do not invent facts or add unsupported assumptions. "
                "If the tool query is already standalone, preserve its "
                "meaning and wording as closely as possible. "
                "Return only the rewritten query, without explanation."
            ),
        },
        {
            "role": "user",
            "content": (
                f"CONVERSATION HISTORY:\n{history_text}\n\n"
                f"LATEST USER MESSAGE:\n{latest_user_message}\n\n"
                f"KNOWLEDGE TOOL QUERY:\n{tool_query}"
            ),
        },
    ]

    response = ask_ollama(messages)

    rewritten_query = response.message.content.strip()

    if "</think>" in rewritten_query:
        rewritten_query = rewritten_query.split(
            "</think>", 1
        )[1].strip()

    return rewritten_query.strip('"') or tool_query