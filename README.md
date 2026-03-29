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

## 🚀 SETUP (Follow Every Step)

### Step 0: Get a Free Groq API Key

1. Go to **https://console.groq.com**
2. Sign up (free)
3. Go to **API Keys** → Create new key
4. Copy it — you'll need it in Step 2

---

### Step 1: Install Prerequisites

**Python 3.10+**
- Mac: `brew install python3` OR download from https://python.org
- Windows: Download from https://python.org (check "Add to PATH"!)
- Ubuntu: `sudo apt install python3 python3-pip python3-venv`

**Node.js 18+**
- All platforms: Download from https://nodejs.org (LTS version)

Verify installation:
```bash
python3 --version   # Should show 3.10+
node --version      # Should show 18+
npm --version       # Should show 9+
```

---

### Step 2: Configure Environment

```bash
# Go into backend folder
cd backend

# Copy the example env file
cp .env.example .env

# Open .env in any text editor and add your Groq key:
# GROQ_API_KEY=gsk_xxxxxxxxxxxxxxxxxxxx
```

---

### Step 3: Install Backend Dependencies

```bash
# Make sure you're in the backend/ folder
cd backend

# Create virtual environment
python3 -m venv venv

# Activate it:
# Mac/Linux:
source venv/bin/activate
# Windows:
venv\Scripts\activate

# Install packages (takes 2-3 minutes first time)
pip install -r requirements.txt
```

**What gets installed:**
- `fastapi` — Web framework
- `uvicorn` — ASGI server
- `groq` — LLM API client
- `PyMuPDF` — PDF text extraction
- `sentence-transformers` — Text embeddings
- `faiss-cpu` — Vector similarity search
- `httpx` — Async HTTP client

---

### Step 4: Start the Backend

```bash
# Mac/Linux (from backend/ folder, with venv active):
uvicorn main:app --reload --port 8000

# Windows:
python -m uvicorn main:app --reload --port 8000
```

You should see:
```
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
INFO:     Started reloader process
```

✅ Test it: Open http://localhost:8000 → should show `{"status": "AI Research Assistant API running"}`
✅ API docs: Open http://localhost:8000/docs → interactive Swagger UI

---

### Step 5: Install Frontend Dependencies

**Open a NEW terminal window/tab** (keep backend running):

```bash
# Go into frontend folder
cd frontend

# Install Node packages
npm install
```

---

### Step 6: Start the Frontend

```bash
# From frontend/ folder:
npm run dev
```

You should see:
```
  VITE v5.x.x  ready in 300ms
  ➜  Local:   http://localhost:5173/
```

✅ Open **http://localhost:5173** in your browser

---

## 🎯 How to Use Each Feature

### 🔍 Phase 1: Discover Papers
1. Click the **Discover** tab
2. Type a topic (e.g., `"attention mechanism"`)
3. Click **Get Papers**
4. Papers from the last 7 days appear

### ⚡ Phase 2: Summarize a Paper
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

### 🧠 Phase 4: RAG Deep Chat
1. Upload a PDF first (builds vector index)
2. Click **Deep Chat** tab
3. The green indicator shows RAG is active
4. Ask detailed questions — answers come from actual paper chunks

### ⬇️ Download Papers
- Click **Download PDF** on any paper card
- If PDF is available, it downloads/opens

---

## 🔌 API Endpoints Reference

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

## ❌ Common Errors & Fixes

### "Failed to fetch papers"
- Backend not running → Start it: `uvicorn main:app --reload`
- Wrong port → Make sure it's on port 8000

### "Groq API error"
- API key not set → Edit `backend/.env` and add `GROQ_API_KEY=...`
- Key invalid → Get new key at https://console.groq.com

### "No papers found"
- Try broader keywords: `"machine learning"` instead of very specific topics
- Semantic Scholar may not have papers from exactly last 7 days for niche topics

### "PDF extraction failed"
- PDF might be scanned/image-only → Try a text-based PDF
- File too large → Keep under 20MB

### "No context available" in chat
- Upload a PDF first for RAG mode
- Or use the quick chat on paper cards (abstract mode)

### CORS error in browser
- Make sure backend is running on port 8000
- Vite proxy routes `/api/*` → `http://localhost:8000`

### Python venv not activating (Windows)
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
venv\Scripts\activate
```

---

## 🔧 Configuration

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

---

## 🤝 Need Help?

If stuck, open Claude and paste:
```
You are a senior AI engineer.
I am building an AI Research Assistant step-by-step.
I am stuck at: [describe your problem]
My error message: [paste error]
Explain simply and give working code. Do not skip steps.
```
