from pydantic import BaseModel


class RetrievalResult(BaseModel):
    chunk_id: str
    source: str
    section: str
    text: str
    score: float
    reranker_score: float | None = None
    
class Source(BaseModel):
    source: str
    section: str


class RAGResponse(BaseModel):
    message: str
    sources: list[Source]