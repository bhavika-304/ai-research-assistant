# 🧠 AI Research Assistant

A full-stack AI-powered research tool with paper discovery, summarization, PDF upload, RAG chat, and knowledge graph reasoning.

---

## 🗺️ What's Built (Phase by Phase)

| Phase | Feature | Status |
|-------|---------|--------|
| 1 | Paper Discovery (Semantic Scholar) | ✅ |
| 2 | AI Summarization (Groq LLaMA) | ✅ |
| 3 | PDF Upload + Text Extraction | ✅ |
| 4 | RAG Chat (FAISS + SentenceTransformers) | ✅ |

---

## 📁 Project Structure

```
ai-research-assistant/
├── backend/
│   ├── main.py              ← FastAPI app (all endpoints)
│   ├── requirements.txt     ← Python dependencies
│   ├── .env.example         ← Copy to .env and add your keys
│   ├── start_backend.sh     ← Mac/Linux start script
│   └── start_backend.bat    ← Windows start script
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx                    ← Main app with tabs
│   │   ├── index.css                  ← Global styles
│   │   ├── main.jsx                   ← Entry point
│   │   ├── components/
│   │   │   ├── PaperCard.jsx          ← Paper card with actions
│   │   │   ├── PDFUploader.jsx        ← PDF drag-and-drop
│   │   │   └── RAGChatPanel.jsx       ← Deep chat interface
│   │   └── utils/
│   │       └── api.js                 ← API helper functions
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
│
├── setup.sh                 ← One-command setup (Mac/Linux)
└── README.md
```

---


---

## 🎯 How to Use Each Feature

### 🔍 Phase 1: Discover Papers
1. Click the **Discover** tab
2. Type a topic (e.g., `"attention mechanism"`)
3. Click **Get Papers**
4. Papers from the last 7 days appear

### Phase 2: Summarize a Paper
1. Find any paper card
2. Click **Summarize** button
3. AI gives you:
   - Plain English summary
   - Key bullet points
   - Difficulty level (Beginner/Intermediate/Advanced)
   - Research area
   - What's novel about it

### 💬 Quick Chat (abstract-based)
1. On any paper card, click **Chat**
2. Ask questions about the paper's abstract
3. AI answers from the abstract context

### 📄 Phase 3: Upload a PDF
1. Click **Upload PDF** tab
2. Drag-and-drop any research paper PDF
3. Text is extracted automatically
4. Click **Summarize This PDF** for full paper summary

###  Phase 4: RAG Deep Chat
1. Upload a PDF first (builds vector index)
2. Click **Deep Chat** tab
3. The green indicator shows RAG is active
4. Ask detailed questions — answers come from actual paper chunks

###  Download Papers
- Click **Download PDF** on any paper card
- If PDF is available, it downloads/opens

---

##  API Endpoints Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/papers?q=keyword` | Search papers (last 7 days) |
| POST | `/summarize` | Summarize text with Groq |
| POST | `/upload-pdf` | Extract PDF text + build RAG index |
| POST | `/chat` | RAG-powered question answering |
| GET | `/rag-status` | Check if RAG index is loaded |
| GET | `/health` | Health check |
| GET | `/docs` | Interactive API documentation |

---



---

##  Configuration

Edit `backend/.env`:
```env
GROQ_API_KEY=gsk_your_key_here
```

Edit `frontend/vite.config.js` to change backend URL if needed:
```js
proxy: {
  '/api': {
    target: 'http://localhost:8000',  // Change this if backend runs elsewhere
  }
}
```

---

## 🧠 Architecture

```
Browser (React + Vite)
    │
    │ /api/* (proxied by Vite dev server)
    ▼
FastAPI Backend (port 8000)
    ├── GET /papers ──────────► Semantic Scholar API
    ├── POST /summarize ───────► Groq API (LLaMA 3)
    ├── POST /upload-pdf ──────► PyMuPDF (text extraction)
    │                            SentenceTransformer (embeddings)
    │                            FAISS (vector index)
    └── POST /chat ────────────► FAISS retrieval → Groq API
```

---

## 📦 Tech Stack

**Backend:**
- FastAPI + Uvicorn
- Groq (LLaMA 3 8B)
- PyMuPDF (fitz)
- sentence-transformers (all-MiniLM-L6-v2)
- FAISS (vector similarity)
- Semantic Scholar API (free, no key needed)

**Frontend:**
- React 18 + Vite
- Tailwind CSS
- Lucide React icons
- Custom dark UI with glass morphism

---

## 🆓 Free Tier Limits

| Service | Free Limit |
|---------|-----------|
| Semantic Scholar | Unlimited (public API) |
| Groq API | 14,400 tokens/minute free |
| Everything else | Runs locally |

