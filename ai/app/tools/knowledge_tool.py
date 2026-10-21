import logging

from app.rag.generation import generate_rag_response
from app.rag.query_rewriter import rewrite_query

logger = logging.getLogger(__name__)

knowledge_search_tool = {
    "name": "knowledge_search",
    "description": (
        "Search KK Store's internal knowledge base for information "
        "about store policies such as shipping, returns, payments, "
        "warranty, and product care."
    ),
    "parameters": {
        "type": "object",
        "properties": {
            "query": {
                "type": "string",
                "description": (
                    "The question to answer using KK Store's "
                    "knowledge base."
                ),
            }
        },
        "required": ["query"],
    },
}




async def knowledge_search(
    query: str,
    conversation_history: list[dict] | None = None,
    latest_user_message: str | None = None,
):
    rewritten_query = rewrite_query(
        conversation_history=conversation_history or [],
        latest_user_message=latest_user_message or query,
        tool_query=query,
    )
    logger.debug("Knowledge search query rewritten")

    response = generate_rag_response(rewritten_query)

    return response.model_dump()