from __future__ import annotations

from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from rag_engine import ask_ai, get_health_status, get_system_info, list_documents, save_document
from vector_db import get_collection_stats, initialize_vector_db, search_all_collections

app = FastAPI(title="AthNexus AI Backend", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class ChatRequest(BaseModel):
    message: str | None = None
    question: str | None = None
    user_id: str | None = None
    sport: str | None = None

    def prompt(self) -> str:
        return (self.question or self.message or "").strip()


class VectorSearchRequest(BaseModel):
    query: str
    top_k: int = 4


@app.get("/")
def root():
    return {
        "name": "AthNexus AI Backend",
        "status": "ok",
    }


@app.get("/health")
@app.get("/api/health")
def health():
    return get_health_status()


@app.get("/rag/info")
@app.get("/api/rag/info")
def rag_info():
    return get_system_info()


@app.post("/vector-db/init")
@app.post("/api/vector-db/init")
def init_vector_db():
    """Initialize the vector database with sample data."""
    try:
        results = initialize_vector_db()
        return {
            "status": "success",
            "message": "Vector database initialized",
            "counts": results,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Vector DB initialization failed: {e}") from e


@app.get("/vector-db/stats")
@app.get("/api/vector-db/stats")
def vector_db_stats():
    """Get vector database collection statistics."""
    try:
        stats = get_collection_stats()
        return {
            "status": "success",
            "collections": stats,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get stats: {e}") from e


@app.post("/vector-db/search")
@app.post("/api/vector-db/search")
def search_vector_db(request: VectorSearchRequest):
    """Search the vector database directly."""
    if not request.query.strip():
        raise HTTPException(status_code=422, detail="Query cannot be empty")

    try:
        results = search_all_collections(request.query, top_k=request.top_k)
        return {
            "status": "success",
            "query": request.query,
            "results": results,
            "count": len(results),
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Vector search failed: {e}") from e


@app.get("/documents/list")
@app.get("/api/documents/list")
def documents_list():
    documents = list_documents()
    return {
        "documents": documents,
        "count": len(documents),
    }


@app.post("/documents/upload")
@app.post("/api/documents/upload")
async def upload_document(file: UploadFile = File(...)):
    if not file.filename:
        raise HTTPException(status_code=400, detail="Filename is required")

    file_content = await file.read()

    try:
        saved = save_document(file.filename, file_content)
    except ValueError as error:
        raise HTTPException(status_code=400, detail=str(error)) from error

    return {
        "message": "Document uploaded successfully",
        **saved,
    }


@app.post("/chat")
@app.post("/api/chat")
def chat(req: ChatRequest):
    prompt = req.prompt()
    if not prompt:
        raise HTTPException(status_code=422, detail="A message or question is required")

    try:
        return ask_ai(prompt)
    except ValueError as error:
        raise HTTPException(status_code=422, detail=str(error)) from error
    except RuntimeError as error:
        raise HTTPException(status_code=503, detail=str(error)) from error
    except Exception as error:
        raise HTTPException(status_code=500, detail=f"AI request failed: {error}") from error
