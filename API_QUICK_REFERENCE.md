# API Connection Quick Reference

## 🚀 Quick Start (5 Minutes)

### 1. Start Backend
```bash
cd backend
python main.py
```
✅ Runs on: `http://localhost:8000`

### 2. Start Frontend
```bash
cd app
npm run dev
```
✅ Available on: `http://localhost:5173`

### 3. Test Connection
Open browser to frontend and go to **AI Assistant** page. Should show **"Connected"** status.

---

## 📊 API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/chat` | POST | Send query & get answer |
| `/api/health` | GET | Check system status |
| `/api/rag/info` | GET | Get system info |
| `/api/vector-db/stats` | GET | Vector DB statistics |
| `/api/vector-db/search` | POST | Search vector database |
| `/api/documents/list` | GET | List documents |
| `/api/documents/upload` | POST | Upload new document |

---

## 🔌 Complete Connection Flow

```
User Types Question
        ↓
Frontend forms ChatRequest
        ↓
POST /api/chat
        ↓
Backend receives request
        ↓
ask_ai() retrieves sources
        ↓
Vector DB searches (or keyword fallback)
        ↓
Build context with sources
        ↓
Call Groq LLM with context
        ↓
LLM generates answer
        ↓
Return ChatResponse (200 OK)
        ↓
Frontend displays answer + sources
        ↓
User sees response
```

---

## ✅ Verify Everything Works

### Test 1: Health Check
```bash
curl http://localhost:8000/api/health
```
✅ Should return status "ok"

### Test 2: Send Query
```bash
curl -X POST http://localhost:8000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"question": "What are NCAA GPA requirements?"}'
```
✅ Should return answer with sources

### Test 3: Vector Search
```bash
curl -X POST http://localhost:8000/api/vector-db/search \
  -H "Content-Type: application/json" \
  -d '{"query": "college academics", "top_k": 3}'
```
✅ Should return semantic search results

### Test 4: Automated Tests
```bash
cd backend
python test_api_connection.py
```
✅ Runs comprehensive API tests

---

## 🎯 Key Files

### Frontend
- `app/src/services/ragChatService.ts` - API client
- `app/src/pages/dashboard/AIAssistant.tsx` - Chat UI
- `app/src/types/rag.ts` - TypeScript types

### Backend
- `backend/main.py` - FastAPI server with endpoints
- `backend/rag_engine.py` - RAG processing logic
- `backend/vector_db.py` - Vector database
- `backend/requirements.txt` - Python dependencies

---

## 📝 Request/Response Format

### Request (Frontend → Backend)
```json
POST /api/chat
Content-Type: application/json

{
  "question": "What should I eat before competition?",
  "user_id": "athlete_123",
  "sport": "basketball"
}
```

### Response (Backend → Frontend)
```json
HTTP 200 OK
Content-Type: application/json

{
  "answer": "Before competition, eat 2-3 hours...",
  "sources": [
    {
      "filename": "nutrition",
      "title": "nutrition - pre_competition",
      "content": "Eat...",
      "score": 0.92,
      "source_type": "vector_search"
    }
  ],
  "confidence": 0.92,
  "retrieval_time_ms": 145.32
}
```

---

## 🔧 Configuration

### Backend `.env` File
```bash
GROQ_API_KEY=your_api_key_here
GROQ_MODEL=llama-3.1-8b-instant
```

### Frontend API URL
```typescript
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api'
```
Points to: `http://localhost:8000/api`

---

## ❌ Troubleshooting

### Issue: "Connection Refused"
**Solution:** Start backend
```bash
cd backend
python main.py
```

### Issue: "GROQ_API_KEY not found"
**Solution:** Set in `.env`
```bash
echo "GROQ_API_KEY=your_key" >> backend/.env
```

### Issue: "No vector database"
**Solution:** Initialize it
```bash
cd backend
python setup_vector_db.py
```

### Issue: Offline Status in UI
**Solution:** Check health endpoint
```bash
curl http://localhost:8000/api/health
```

---

## 📋 Component Verification

### ✅ Frontend Component
- `AIAssistant.tsx` sends POST to `/api/chat`
- `ragChatService.ts` handles HTTP requests
- Displays responses in chat UI
- Shows sources below answers

### ✅ Backend Route
- `main.py` has `@app.post("/api/chat")`
- Validates request with `ChatRequest` model
- Calls `ask_ai()` from `rag_engine.py`
- Returns `ChatResponse` JSON

### ✅ RAG Engine
- `ask_ai()` processes question
- Retrieves sources via vector DB
- Builds context from sources
- Calls Groq LLM
- Returns formatted response

### ✅ Vector Database
- 4 collections with 22+ documents
- Semantic search via Chroma
- Fallback to keyword search
- Returns ranked results

### ✅ Error Handling
- Empty query → 422 error
- Missing API key → 503 error
- Processing error → 500 error
- Frontend displays errors

---

## 🎓 Example Queries

**College Academics:**
- "What are NCAA eligibility requirements?"
- "What scholarships are available?"
- "How do I balance sports and studies?"

**Sports Events:**
- "What championships are coming up?"
- "Tell me about the football trials"
- "What events can I participate in?"

**Training:**
- "How do I do HIIT training?"
- "What's a good strength training routine?"
- "How can I improve flexibility?"

**Nutrition:**
- "What should I eat before competition?"
- "Best post-workout recovery food?"
- "How much water should I drink?"

---

## 📊 Performance

| Metric | Value |
|--------|-------|
| Response Time | 1-5 seconds |
| Vector Search | 50-100ms |
| LLM Generation | 1-3 seconds |
| Concurrent Users | 20+ |
| Memory Usage | 500MB-1GB |

---

## 🔐 Security

- ✅ CORS enabled for frontend
- ✅ Input validated with Pydantic
- ✅ Environment variables for secrets
- ✅ Empty requests rejected
- ✅ Error messages don't expose internals

---

## 📞 Support

**For detailed information, see:**
- `API_CONNECTION_VERIFICATION_REPORT.md` - Complete verification
- `API_CONNECTION_FLOW_DIAGRAM.md` - Architecture & flow
- `API_CONNECTION_VERIFICATION.md` - Testing guide
- `VECTOR_DATABASE_SETUP.md` - Vector DB documentation
- `VECTOR_DATABASE_QUICK_START.md` - Quick setup

---

## ✨ Status

**✅ ALL API ENDPOINTS PROPERLY CONNECTED**

- Frontend ↔ Backend: **Connected**
- Backend ↔ RAG Engine: **Connected**
- RAG Engine ↔ Vector DB: **Connected**
- RAG Engine ↔ LLM: **Connected**
- Response Flow: **Complete**

Your RAG chatbot is ready to serve athlete queries! 🏆
