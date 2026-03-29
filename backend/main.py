"""
AI Research Assistant - FastAPI Backend
Phases: Paper Discovery → Summarize → PDF Upload → RAG → Knowledge Graph
"""

from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import Optional, List
import httpx
import os
import re
import json
import tempfile
import asyncio
import time
from datetime import datetime, timedelta
from groq import Groq
import fitz  # PyMuPDF
import numpy as np
import faiss
from sentence_transformers import SentenceTransformer
import pickle

from dotenv import load_dotenv
import os

load_dotenv()
# ─── App Setup ────────────────────────────────────────────────────────────────
app = FastAPI(title="AI Research Assistant", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Config ───────────────────────────────────────────────────────────────────
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
SEMANTIC_SCHOLAR_BASE = "https://api.semanticscholar.org/graph/v1"

groq_client = Groq(api_key=GROQ_API_KEY)

# ─── RAG State (in-memory for prototype) ─────────────────────────────────────
rag_index = None
rag_chunks = []
rag_metadata = []
embedding_model = None

def get_embedding_model():
    global embedding_model
    if embedding_model is None:
        print("Loading embedding model...")
        embedding_model = SentenceTransformer("all-MiniLM-L6-v2")
    return embedding_model

# ═══════════════════════════════════════════════════════════════════════════════
# PHASE 1 — PAPER DISCOVERY
# ═══════════════════════════════════════════════════════════════════════════════

# ─── Simple in-memory rate limit tracker ─────────────────────────────────────
_last_request_time: float = 0.0
_MIN_REQUEST_INTERVAL = 1.2   # seconds between requests to Semantic Scholar

async def _fetch_with_retry(url: str, params: dict, max_retries: int = 3) -> dict:
    """
    Call Semantic Scholar with:
      • Minimum 1.2 s gap between any two requests
      • Exponential back-off on 429 (2 s → 4 s → 8 s)
      • Automatic fallback: remove date filter on 4xx
    """
    global _last_request_time

    # ── enforce minimum gap ──────────────────────────────────────────────────
    elapsed = time.monotonic() - _last_request_time
    if elapsed < _MIN_REQUEST_INTERVAL:
        await asyncio.sleep(_MIN_REQUEST_INTERVAL - elapsed)

    headers = {
        "User-Agent": "AI-Research-Assistant/1.0 (learning project)",
    }

    # ── try WITH date filter first ───────────────────────────────────────────
    last_err = None
    for attempt in range(max_retries):
        try:
            _last_request_time = time.monotonic()
            async with httpx.AsyncClient(timeout=20.0) as client:
                resp = await client.get(url, params=params, headers=headers)

            if resp.status_code == 429:
                wait = 2 ** (attempt + 1)          # 2 s, 4 s, 8 s
                print(f"[papers] 429 rate-limit — waiting {wait}s (attempt {attempt+1})")
                await asyncio.sleep(wait)
                last_err = f"Rate limited (429) — retried {attempt+1} times"
                continue

            resp.raise_for_status()
            data = resp.json()
            if data.get("data"):
                return data
            # empty result with date filter → fall through to no-date fallback
            break

        except httpx.TimeoutException:
            raise HTTPException(status_code=504, detail="Semantic Scholar API timed out")
        except httpx.HTTPStatusError as e:
            last_err = str(e)
            if e.response.status_code == 429:
                wait = 2 ** (attempt + 1)
                await asyncio.sleep(wait)
                continue
            break   # other 4xx → skip to fallback

    # ── fallback: drop date + sort filters ───────────────────────────────────
    fallback_params = {k: v for k, v in params.items()
                       if k not in ("publicationDateOrYear", "sort")}
    print("[papers] Trying fallback without date filter...")

    for attempt in range(max_retries):
        try:
            elapsed = time.monotonic() - _last_request_time
            if elapsed < _MIN_REQUEST_INTERVAL:
                await asyncio.sleep(_MIN_REQUEST_INTERVAL - elapsed)

            _last_request_time = time.monotonic()
            async with httpx.AsyncClient(timeout=20.0) as client:
                resp = await client.get(url, params=fallback_params, headers=headers)

            if resp.status_code == 429:
                wait = 2 ** (attempt + 1)
                print(f"[papers] fallback 429 — waiting {wait}s")
                await asyncio.sleep(wait)
                continue

            resp.raise_for_status()
            return resp.json()

        except httpx.TimeoutException:
            raise HTTPException(status_code=504, detail="Semantic Scholar API timed out")
        except httpx.HTTPStatusError as e:
            last_err = str(e)
            if e.response.status_code == 429:
                wait = 2 ** (attempt + 1)
                await asyncio.sleep(wait)
                continue
            raise HTTPException(status_code=502, detail=f"Semantic Scholar error: {last_err}")

    raise HTTPException(
        status_code=429,
        detail="Semantic Scholar is rate-limiting us. Please wait 30 seconds and try again."
    )


@app.get("/papers")
async def get_papers(q: str, limit: int = 10):
    """Fetch latest papers from Semantic Scholar API with retry & fallback."""
    if not q.strip():
        raise HTTPException(status_code=400, detail="Query cannot be empty")

    seven_days_ago = (datetime.now() - timedelta(days=7)).strftime("%Y-%m-%d")
    today = datetime.now().strftime("%Y-%m-%d")

    url = f"{SEMANTIC_SCHOLAR_BASE}/paper/search"
    params = {
        "query": q,
        "limit": min(limit, 10),   # smaller limit = less likely to 429
        "fields": "title,abstract,authors,year,externalIds,openAccessPdf,url,publicationDate",
        "publicationDateOrYear": f"{seven_days_ago}:{today}",
        "sort": "publicationDate:desc",
    }

    data = await _fetch_with_retry(url, params)

    papers = []
    for paper in data.get("data", []):
        # Extract PDF URL
        pdf_url = None
        if paper.get("openAccessPdf"):
            pdf_url = paper["openAccessPdf"].get("url")

        # Extract arXiv PDF URL as fallback
        ext_ids = paper.get("externalIds", {}) or {}
        arxiv_id = ext_ids.get("ArXiv")
        if not pdf_url and arxiv_id:
            pdf_url = f"https://arxiv.org/pdf/{arxiv_id}.pdf"

        # Build paper URL
        paper_url = paper.get("url") or ""
        if not paper_url and arxiv_id:
            paper_url = f"https://arxiv.org/abs/{arxiv_id}"

        # Clean authors
        authors = paper.get("authors") or []
        author_names = [a.get("name", "") for a in authors[:5] if a.get("name")]

        papers.append({
            "paperId": paper.get("paperId", ""),
            "title": paper.get("title") or "Untitled",
            "abstract": (paper.get("abstract") or "No abstract available.")[:800],
            "authors": author_names,
            "year": paper.get("year"),
            "publicationDate": paper.get("publicationDate"),
            "url": paper_url,
            "pdfUrl": pdf_url,
        })

    return {"papers": papers, "total": len(papers), "query": q}


# ═══════════════════════════════════════════════════════════════════════════════
# PHASE 2 — AI SUMMARIZATION (Groq)
# ═══════════════════════════════════════════════════════════════════════════════

class SummarizeRequest(BaseModel):
    text: str
    title: Optional[str] = None

@app.post("/summarize")
async def summarize(req: SummarizeRequest):
    """Summarize research text using Groq LLM."""
    text = req.text.strip()
    if not text:
        raise HTTPException(status_code=400, detail="Text cannot be empty")

    # Truncate very long text safely (Groq has token limits)
    max_chars = 6000
    if len(text) > max_chars:
        text = text[:max_chars] + "...[truncated]"

    title_context = f'Title: "{req.title}"\n\n' if req.title else ""

    prompt = f"""You are an expert AI research assistant. Analyze this research paper and respond ONLY with valid JSON.

{title_context}Abstract/Text:
{text}

Respond with this exact JSON structure:
{{
  "summary": "2-3 sentence plain English explanation of what this paper does and why it matters",
  "key_points": ["point 1", "point 2", "point 3", "point 4"],
  "difficulty": "Beginner | Intermediate | Advanced",
  "research_area": "e.g. Computer Vision, NLP, Reinforcement Learning",
  "novelty": "What's new or different about this work in 1 sentence"
}}"""

    try:
        response = groq_client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.3,
            max_tokens=700,
        )
        raw = response.choices[0].message.content.strip()

        # Strip markdown code fences if present
        raw = re.sub(r"```json\s*", "", raw)
        raw = re.sub(r"```\s*", "", raw)

        result = json.loads(raw)
        return result

    except json.JSONDecodeError:
        # Fallback if JSON parsing fails
        return {
            "summary": raw[:300] if raw else "Could not generate summary.",
            "key_points": ["See raw summary above"],
            "difficulty": "Unknown",
            "research_area": "Unknown",
            "novelty": "N/A",
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Groq API error: {str(e)}")


# ═══════════════════════════════════════════════════════════════════════════════
# PHASE 3 — PDF UPLOAD & EXTRACTION
# ═══════════════════════════════════════════════════════════════════════════════

@app.post("/upload-pdf")
async def upload_pdf(file: UploadFile = File(...)):
    """Extract text from uploaded PDF using PyMuPDF."""
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are accepted")

    contents = await file.read()

    try:
        with tempfile.NamedTemporaryFile(suffix=".pdf", delete=False) as tmp:
            tmp.write(contents)
            tmp_path = tmp.name

        doc = fitz.open(tmp_path)
        full_text = []

        for page_num in range(len(doc)):
            page = doc[page_num]
            full_text.append(page.get_text())

        doc.close()
        os.unlink(tmp_path)

        raw_text = "\n".join(full_text)

        # Clean text
        cleaned = _clean_pdf_text(raw_text)

        # Build RAG index from this PDF
        _build_rag_index(cleaned, file.filename)

        return {
            "filename": file.filename,
            "pages": len(full_text),
            "text": cleaned[:5000],  # First 5000 chars for display
            "full_length": len(cleaned),
            "rag_ready": True,
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"PDF extraction failed: {str(e)}")


def _clean_pdf_text(text: str) -> str:
    """Remove references section, extra whitespace, and garbage characters."""
    # Remove References section (common in papers)
    ref_patterns = [
        r"\n\s*References\s*\n.*",
        r"\n\s*Bibliography\s*\n.*",
        r"\n\s*REFERENCES\s*\n.*",
    ]
    for pattern in ref_patterns:
        text = re.sub(pattern, "", text, flags=re.DOTALL)

    # Remove excessive whitespace
    text = re.sub(r"\n{3,}", "\n\n", text)
    text = re.sub(r" {2,}", " ", text)
    text = re.sub(r"[^\x00-\x7F]+", " ", text)  # Remove non-ASCII

    return text.strip()


# ═══════════════════════════════════════════════════════════════════════════════
# PHASE 4 — RAG (Retrieval Augmented Generation)
# ═══════════════════════════════════════════════════════════════════════════════

def _chunk_text(text: str, chunk_size: int = 600, overlap: int = 100) -> List[str]:
    """Split text into overlapping chunks preserving sentence boundaries."""
    sentences = re.split(r"(?<=[.!?])\s+", text)
    chunks = []
    current_chunk = []
    current_size = 0

    for sentence in sentences:
        words = sentence.split()
        word_count = len(words)

        if current_size + word_count > chunk_size and current_chunk:
            chunks.append(" ".join(current_chunk))
            # Keep last overlap words
            overlap_words = current_chunk[-overlap:] if len(current_chunk) > overlap else current_chunk
            current_chunk = overlap_words[:]
            current_size = len(overlap_words)

        current_chunk.extend(words)
        current_size += word_count

    if current_chunk:
        chunks.append(" ".join(current_chunk))

    return chunks


def _build_rag_index(text: str, source: str = "uploaded_pdf"):
    """Build FAISS index from text chunks."""
    global rag_index, rag_chunks, rag_metadata

    chunks = _chunk_text(text)
    if not chunks:
        return

    model = get_embedding_model()
    embeddings = model.encode(chunks, show_progress_bar=False)
    embeddings = np.array(embeddings).astype("float32")

    # Normalize for cosine similarity
    faiss.normalize_L2(embeddings)

    dimension = embeddings.shape[1]
    rag_index = faiss.IndexFlatIP(dimension)  # Inner product = cosine after normalize
    rag_index.add(embeddings)

    rag_chunks = chunks
    rag_metadata = [{"source": source, "chunk_id": i} for i in range(len(chunks))]

    print(f"RAG index built: {len(chunks)} chunks from '{source}'")


def _retrieve_chunks(query: str, top_k: int = 3) -> List[dict]:
    """Embed query and retrieve top-k relevant chunks from FAISS."""
    if rag_index is None or not rag_chunks:
        return []

    model = get_embedding_model()
    query_embedding = model.encode([query]).astype("float32")
    faiss.normalize_L2(query_embedding)

    scores, indices = rag_index.search(query_embedding, top_k)

    results = []
    for score, idx in zip(scores[0], indices[0]):
        if idx < len(rag_chunks):
            results.append({
                "text": rag_chunks[idx],
                "score": float(score),
                "metadata": rag_metadata[idx],
            })

    return results


class ChatRequest(BaseModel):
    question: str
    context_text: Optional[str] = None  # For abstract-based chat without PDF


@app.post("/chat")
async def chat(req: ChatRequest):
    """RAG-powered chat endpoint."""
    question = req.question.strip()
    if not question:
        raise HTTPException(status_code=400, detail="Question cannot be empty")

    # Try RAG retrieval first
    retrieved = _retrieve_chunks(question, top_k=3)

    if retrieved:
        context = "\n\n---\n\n".join([r["text"] for r in retrieved])
        sources = [r["metadata"] for r in retrieved]
        context_source = "PDF (RAG)"
    elif req.context_text:
        context = req.context_text[:4000]
        sources = [{"source": "paper_abstract"}]
        context_source = "Abstract"
    else:
        raise HTTPException(
            status_code=400,
            detail="No context available. Please upload a PDF first or provide context text.",
        )

    prompt = f"""You are an expert research assistant. Answer the question using ONLY the provided context.
If the answer is not in the context, say "I cannot find this in the provided paper."

Context:
{context}

Question: {question}

Give a clear, accurate answer based strictly on the context above."""

    try:
        response = groq_client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.2,
            max_tokens=600,
        )
        answer = response.choices[0].message.content.strip()

        return {
            "answer": answer,
            "sources": sources,
            "context_source": context_source,
            "chunks_used": len(retrieved),
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Chat error: {str(e)}")


@app.get("/rag-status")
async def rag_status():
    """Check if RAG index is loaded."""
    return {
        "index_ready": rag_index is not None,
        "chunks": len(rag_chunks),
        "sources": list(set(m["source"] for m in rag_metadata)) if rag_metadata else [],
    }


# ═══════════════════════════════════════════════════════════════════════════════
# HEALTH CHECK
# ═══════════════════════════════════════════════════════════════════════════════

@app.get("/")
async def root():
    return {"status": "AI Research Assistant API running", "version": "1.0.0"}

@app.get("/health")
async def health():
    return {"status": "ok", "rag_ready": rag_index is not None}