from __future__ import annotations

import math
import os
import re
import time
from pathlib import Path
from typing import Any

from dotenv import load_dotenv
from groq import Groq

from vector_db import initialize_vector_db, search_all_collections, get_collection_stats

BASE_DIR = Path(__file__).resolve().parent
load_dotenv(BASE_DIR / ".env")

DATA_DIR = BASE_DIR / "data"
SUPPORTED_EXTENSIONS = {".txt", ".md", ".markdown"}
DEFAULT_MODEL = os.getenv("GROQ_MODEL", "llama-3.1-8b-instant")

_groq_api_key = os.getenv("GROQ_API_KEY")
_groq_client = Groq(api_key=_groq_api_key) if _groq_api_key else None

_document_chunks: list[dict[str, Any]] = []
_vector_db_initialized = False


def _tokenize(text: str) -> set[str]:
    return set(re.findall(r"[a-zA-Z0-9']+", text.lower()))


def _chunk_text(text: str, chunk_size: int = 700, overlap: int = 120) -> list[str]:
    cleaned_text = re.sub(r"\s+", " ", text).strip()
    if not cleaned_text:
        return []

    chunks: list[str] = []
    start = 0

    while start < len(cleaned_text):
        end = min(start + chunk_size, len(cleaned_text))
        chunk = cleaned_text[start:end].strip()

        if chunk:
            chunks.append(chunk)

        if end >= len(cleaned_text):
            break

        start = max(end - overlap, start + 1)

    return chunks


def _keyword_score(question_tokens: set[str], chunk_tokens: set[str]) -> float:
    if not question_tokens or not chunk_tokens:
        return 0.0

    overlap = len(question_tokens & chunk_tokens)
    if overlap == 0:
        return 0.0

    return overlap / math.sqrt(len(question_tokens) * len(chunk_tokens))


def refresh_documents() -> int:
    global _document_chunks

    DATA_DIR.mkdir(parents=True, exist_ok=True)
    chunks: list[dict[str, Any]] = []

    for file_path in sorted(DATA_DIR.iterdir()):
        if not file_path.is_file() or file_path.suffix.lower() not in SUPPORTED_EXTENSIONS:
            continue

        raw_text = file_path.read_text(encoding="utf-8", errors="ignore").strip()
        if not raw_text:
            continue

        for chunk in _chunk_text(raw_text):
            chunks.append(
                {
                    "filename": file_path.name,
                    "content": chunk,
                    "tokens": _tokenize(chunk),
                }
            )

    _document_chunks = chunks
    return len(_document_chunks)


def _ensure_documents_loaded() -> None:
    if not _document_chunks:
        refresh_documents()


def _initialize_vector_db() -> bool:
    global _vector_db_initialized
    if _vector_db_initialized:
        return True

    try:
        initialize_vector_db()
        _vector_db_initialized = True
        return True
    except Exception:
        return False


def list_documents() -> list[dict[str, Any]]:
    DATA_DIR.mkdir(parents=True, exist_ok=True)

    documents: list[dict[str, Any]] = []
    for file_path in sorted(DATA_DIR.iterdir()):
        if not file_path.is_file() or file_path.suffix.lower() not in SUPPORTED_EXTENSIONS:
            continue

        content = file_path.read_text(encoding="utf-8", errors="ignore")
        documents.append(
            {
                "filename": file_path.name,
                "size_bytes": file_path.stat().st_size,
                "chunks": len(_chunk_text(content)),
            }
        )

    return documents


def save_document(filename: str, content: bytes) -> dict[str, Any]:
    DATA_DIR.mkdir(parents=True, exist_ok=True)

    safe_name = re.sub(r"[^A-Za-z0-9._ -]", "_", Path(filename).name).strip()
    if not safe_name:
        safe_name = f"document-{int(time.time())}.txt"

    suffix = Path(safe_name).suffix.lower()
    if suffix not in SUPPORTED_EXTENSIONS:
        raise ValueError("Only .txt, .md, and .markdown files are supported")

    target_path = DATA_DIR / safe_name
    text = content.decode("utf-8", errors="ignore")
    target_path.write_text(text, encoding="utf-8")

    chunk_count = len(_chunk_text(text))
    refresh_documents()

    return {
        "filename": safe_name,
        "chunks_created": chunk_count,
    }


def retrieve_sources(question: str, limit: int = 4) -> list[dict[str, Any]]:
    if _initialize_vector_db():
        try:
            vector_results = search_all_collections(question, top_k=limit)
            if vector_results:
                return [
                    {
                        "filename": r["metadata"].get("source", "vector_db"),
                        "content": r["content"],
                        "title": r["collection"],
                        "score": r["similarity_score"],
                        "source_type": "vector_search",
                    }
                    for r in vector_results[:limit]
                ]
        except Exception:
            pass

    _ensure_documents_loaded()
    question_tokens = _tokenize(question)

    ranked = sorted(
        (
            {
                "filename": chunk["filename"],
                "content": chunk["content"],
                "title": chunk["filename"],
                "score": round(_keyword_score(question_tokens, chunk["tokens"]), 4),
                "source_type": "keyword_search",
            }
            for chunk in _document_chunks
        ),
        key=lambda x: x["score"],
        reverse=True,
    )

    return [r for r in ranked if r["score"] > 0][:limit] or ranked[:limit]


def ask_ai(question: str) -> dict[str, Any]:
    if not question.strip():
        raise ValueError("Question cannot be empty")

    if not _groq_client:
        raise RuntimeError("GROQ_API_KEY missing in .env")

    start = time.perf_counter()
    sources = retrieve_sources(question)

    context = "\n\n".join(
        f"{s['filename']}:\n{s['content']}" for s in sources
    )

    prompt = f"""
Answer concisely using context if relevant.
If not, say you don’t know.

Context:
{context}

Question:
{question}
"""

    try:
        response = _groq_client.chat.completions.create(
            model=os.getenv("GROQ_MODEL", DEFAULT_MODEL),
            messages=[
                {"role": "system", "content": "You are a helpful sports assistant."},
                {"role": "user", "content": prompt},
            ],
        )

        answer = ""
        if response and response.choices:
            answer = (response.choices[0].message.content or "").strip()

    except Exception as e:
        return {
            "answer": f"Error: {str(e)}",
            "sources": [],
            "confidence": 0.0,
            "retrieval_time_ms": 0,
        }

    return {
        "answer": answer or "No response generated.",
        "sources": sources,
        "confidence": max((s["score"] for s in sources), default=0.0),
        "retrieval_time_ms": round((time.perf_counter() - start) * 1000, 2),
    }


def get_health_status() -> dict[str, Any]:
    return {
        "status": "ok" if _groq_client else "error",
        "message": "Ready" if _groq_client else "Missing API key",
        "documents": len(_document_chunks),
    }


def get_system_info() -> dict[str, Any]:
    return {
        "model": os.getenv("GROQ_MODEL", DEFAULT_MODEL),
        "vector_db": "enabled",
        "documents": len(_document_chunks),
    }