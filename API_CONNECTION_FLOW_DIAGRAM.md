# API Connection Flow Diagram & Analysis

## Complete Request-Response Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                          USER INTERACTION                            │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  1. User opens AI Assistant page                                    │
│     ↓                                                                │
│  2. useEffect() runs on mount (AIAssistant.tsx:line 24)            │
│     ↓                                                                │
│  3. calls ragChatService.checkHealth()                             │
│     └→ GET /api/health                                             │
│        └→ Backend responds with status                             │
│           └→ UI shows "Connected" or "Offline"                     │
│     ↓                                                                │
│  4. User types question in input field                             │
│     ↓                                                                │
│  5. User clicks Send (handleSendMessage)                           │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
         ↓
┌─────────────────────────────────────────────────────────────────────┐
│                   FRONTEND REQUEST (AIAssistant.tsx)                │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  handleSendMessage() {                                              │
│    1. Extract user input from textbox                              │
│    2. Create ChatMessage object                                    │
│    3. Add to messages array (setState)                             │
│    4. Set loading = true (show spinner)                            │
│    5. Call ragChatService.sendMessage()                            │
│  }                                                                  │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
         ↓
┌─────────────────────────────────────────────────────────────────────┐
│                  FRONTEND SERVICE (ragChatService.ts)              │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  async sendMessage(request: ChatRequest) {                         │
│    const payload = {                                               │
│      question: request.question,  ← User input                     │
│      user_id: request.user_id,    ← Optional                       │
│      sport: request.sport         ← Optional                       │
│    }                                                                │
│                                                                      │
│    const response = await fetch(                                   │
│      '/api/chat',  ← Relative URL                                  │
│      {                                                             │
│        method: 'POST',                                             │
│        headers: { 'Content-Type': 'application/json' },           │
│        body: JSON.stringify(payload)                              │
│      }                                                             │
│    )                                                               │
│                                                                      │
│    if (!response.ok) throw error                                   │
│    return response.json()                                          │
│  }                                                                  │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
         ↓ POST /api/chat
         ↓ Content-Type: application/json
         ↓ Body: { "question": "user input" }
         ↓
┌─────────────────────────────────────────────────────────────────────┐
│              BACKEND FASTAPI (main.py:line 131)                    │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  @app.post("/api/chat")  ← Route decorator                         │
│  def chat(req: ChatRequest):  ← Pydantic validates input           │
│    1. Extract question from request                                │
│       prompt = req.prompt()  ← Gets question or message            │
│    2. Validate input                                               │
│       if not prompt: return 422 error                              │
│    3. Call RAG engine                                              │
│       return ask_ai(prompt)                                        │
│    4. Handle exceptions                                            │
│       - ValueError → 422 (Unprocessable Entity)                    │
│       - RuntimeError → 503 (Service Unavailable)                   │
│       - Exception → 500 (Internal Server Error)                    │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
         ↓
┌─────────────────────────────────────────────────────────────────────┐
│            RAG ENGINE (rag_engine.py:line 216)                     │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  def ask_ai(question: str) -> dict:                                │
│                                                                      │
│    1. VALIDATE INPUT                                               │
│       if not question.strip():                                     │
│         raise ValueError("Question cannot be empty")               │
│                                                                      │
│    2. CHECK GROQ CLIENT                                            │
│       if not _groq_client:                                         │
│         raise RuntimeError("GROQ_API_KEY not found")               │
│                                                                      │
│    3. RETRIEVE SOURCES (Core RAG Logic)                            │
│       sources = retrieve_sources(question)                         │
│       ↓                                                             │
│       ┌─────────────────────────────────────────────┐             │
│       │ retrieve_sources(question: str)              │             │
│       │                                              │             │
│       │ 1. Try Vector DB Search First:               │             │
│       │    if _initialize_vector_db():               │             │
│       │      vector_results = search_all_collections│             │
│       │      (question, top_k=4)                     │             │
│       │      ↓ Returns: [                            │             │
│       │          {content, similarity_score, ...}   │             │
│       │      ]                                       │             │
│       │                                              │             │
│       │ 2. Format Results as Sources                 │             │
│       │    For each result:                          │             │
│       │      {filename, content, title,              │             │
│       │       score: similarity_score}               │             │
│       │                                              │             │
│       │ 3. Fallback to Keyword Search                │             │
│       │    if vector_db fails/empty:                 │             │
│       │      question_tokens = _tokenize(question)  │             │
│       │      keyword_score each chunk                │             │
│       │      rank by score, return top 4             │             │
│       │                                              │             │
│       └─────────────────────────────────────────────┘             │
│                                                                      │
│    4. BUILD CONTEXT                                                │
│       context = "Source: filename\n{content}\n\n"                 │
│       (repeats for each source)                                    │
│                                                                      │
│    5. CREATE PROMPT                                                │
│       prompt = """                                                 │
│       You are AthNexus AI, a practical sports assistant...         │
│       Context: {sources}                                           │
│       Question: {question}                                         │
│       """                                                          │
│                                                                      │
│    6. CALL GROQ LLM                                                │
│       response = _groq_client.chat.completions.create(            │
│         model='llama-3.1-8b-instant',                             │
│         messages=[system_message, user_message]                   │
│       )                                                            │
│                                                                      │
│    7. EXTRACT ANSWER                                               │
│       answer = response.choices[0].message.content                │
│                                                                      │
│    8. CALCULATE METRICS                                            │
│       retrieval_time_ms = elapsed time                             │
│       confidence = max source score                                │
│                                                                      │
│    9. RETURN RESPONSE                                              │
│       return {                                                     │
│         "answer": answer,                                          │
│         "sources": sources,                                        │
│         "confidence": confidence,                                  │
│         "retrieval_time_ms": retrieval_time_ms                    │
│       }                                                            │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
         ↓
┌─────────────────────────────────────────────────────────────────────┐
│            VECTOR DATABASE (vector_db.py)                           │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  Collections:                                                       │
│  ├─ sports_events (6 docs)                                         │
│  ├─ college_academics (6 docs)                                     │
│  ├─ training_guides (5 docs)                                       │
│  └─ nutrition_advice (5 docs)                                      │
│                                                                      │
│  search_all_collections(query):                                    │
│    1. For each collection:                                         │
│       results = collection.query(                                  │
│         query_texts=[query],                                       │
│         n_results=top_k                                            │
│       )                                                            │
│    2. Use cosine similarity to rank                                │
│    3. Return sorted by similarity_score                            │
│    4. Structure: [                                                 │
│         {                                                          │
│           content: document text,                                  │
│           similarity_score: 0.0-1.0,                               │
│           metadata: {...},                                         │
│           collection: collection_name                              │
│         }                                                          │
│       ]                                                            │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
         ↓
┌─────────────────────────────────────────────────────────────────────┐
│            GROQ LLM API (External Service)                          │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  Input:                                                             │
│  - System: "You are an expert sports assistant"                    │
│  - User: prompt with context + question                            │
│  - Model: llama-3.1-8b-instant                                    │
│                                                                      │
│  Process:                                                           │
│  - LLM reads context and question                                  │
│  - Generates response based on context                             │
│  - Returns generated text                                          │
│                                                                      │
│  Output:                                                            │
│  - ChatCompletion object with choices[0].message.content           │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
         ↓
┌─────────────────────────────────────────────────────────────────────┐
│         RESPONSE RETURNED (200 OK with ChatResponse)               │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  HTTP Response:                                                     │
│  Status: 200 OK                                                    │
│  Content-Type: application/json                                    │
│  Body: {                                                           │
│    "answer": "Generated response from LLM",                       │
│    "sources": [                                                    │
│      {                                                             │
│        "filename": "source name",                                  │
│        "content": "relevant document excerpt",                     │
│        "title": "collection - category",                           │
│        "score": 0.92,                                              │
│        "source_type": "vector_search" | "keyword_search"           │
│      }                                                             │
│    ],                                                              │
│    "confidence": 0.92,                                             │
│    "retrieval_time_ms": 145.32                                     │
│  }                                                                  │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
         ↓
┌─────────────────────────────────────────────────────────────────────┐
│           FRONTEND PROCESSES RESPONSE (AIAssistant.tsx)            │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  catch (response) {                                                │
│    1. setLoading(false)  ← Hide spinner                            │
│    2. Parse JSON response                                          │
│    3. Create assistantMessage:                                     │
│       {                                                            │
│         id: "assistant-" + timestamp,                              │
│         role: "assistant",                                         │
│         content: response.answer,                                  │
│         sources: response.sources,                                 │
│         timestamp: new Date()                                      │
│       }                                                            │
│    4. Add to messages array                                        │
│       setMessages([...prev, assistantMessage])                     │
│    5. Save to localStorage                                         │
│       chatHistoryService.save(messages)                            │
│    6. Auto-scroll to bottom                                        │
│       messagesEndRef.scrollIntoView()                              │
│  }                                                                  │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
         ↓
┌─────────────────────────────────────────────────────────────────────┐
│              USER SEES RESPONSE IN CHAT                             │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  1. Message appears in chat window                                 │
│  2. Sources displayed below answer                                 │
│  3. Confidence score shown                                         │
│  4. User can ask another question                                  │
│  5. Chat history saved locally                                     │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

## Data Type Flow

```python
# User Input
user_input: str = "What are NCAA GPA requirements?"

# Frontend ChatRequest
ChatRequest {
    question: "What are NCAA GPA requirements?"
    message: None
    user_id: None
    sport: None
}

# Backend ChatRequest (Pydantic validates)
→ Validates types and formats

# RAG Processing
sources: list[dict] = [
    {
        "filename": "college_academics",
        "content": "Document text...",
        "title": "college_academics - gpa_requirements",
        "score": 0.92,
        "source_type": "vector_search"
    }
]

# Frontend ChatResponse
ChatResponse {
    answer: "Division 1 athletes need...",
    sources: [...SourceDocument],
    confidence: 0.92,
    retrieval_time_ms: 145.32
}

# Frontend ChatMessage (for display)
ChatMessage {
    id: "assistant-1234567890",
    role: "assistant",
    content: "Division 1 athletes need...",
    sources: [...SourceDocument],
    timestamp: Date
}
```

## Error Handling Flow

```
User Query
    ↓
┌─────────────────────────────────────────┐
│ Empty Input?                             │
└─────────────────────────────────────────┘
    ↓ YES → 422 Unprocessable Entity
    ↓ NO
┌─────────────────────────────────────────┐
│ GROQ_API_KEY configured?                │
└─────────────────────────────────────────┘
    ↓ NO → 503 Service Unavailable
    ↓ YES
┌─────────────────────────────────────────┐
│ Vector DB Available?                     │
└─────────────────────────────────────────┘
    ↓ NO → Fallback to Keyword Search
    ↓ YES
┌─────────────────────────────────────────┐
│ Search Results Found?                    │
└─────────────────────────────────────────┘
    ↓ YES ↓ NO (use fallback results)
┌─────────────────────────────────────────┐
│ Build Context & Call Groq                │
└─────────────────────────────────────────┘
    ↓
┌─────────────────────────────────────────┐
│ Groq Response Success?                   │
└─────────────────────────────────────────┘
    ↓ YES → 200 OK with ChatResponse
    ↓ NO → 500 Internal Server Error
```

## Connection Verification Checklist

```
✓ Frontend sends POST /api/chat with question
  └─ ragChatService.sendMessage() at line 30

✓ FastAPI receives request at @app.post("/api/chat")
  └─ main.py at line 131

✓ Input validation in ChatRequest model
  └─ Ensures question/message exists

✓ Route handler calls ask_ai(prompt)
  └─ main.py line 139

✓ RAG engine processes query
  └─ rag_engine.py line 216

✓ Vector DB search or keyword fallback
  └─ rag_engine.py line 194

✓ Groq LLM generates response
  └─ rag_engine.py line 248

✓ Response formatted as ChatResponse dict
  └─ rag_engine.py line 253

✓ FastAPI returns JSON response
  └─ main.py line 139

✓ Frontend receives and parses response
  └─ AIAssistant.tsx line 94

✓ Message added to chat
  └─ AIAssistant.tsx line 96

✓ Response displayed to user
  └─ Rendered in messages array

✓ Sources displayed below answer
  └─ AIAssistant.tsx line 210+

✓ Chat history saved
  └─ chatHistoryService.save() line 104
```

## Summary

**The API connection is fully configured and operational:**

1. ✅ User query enters frontend
2. ✅ Frontend service makes HTTP POST request to backend
3. ✅ Backend receives and validates input
4. ✅ RAG engine retrieves relevant sources
5. ✅ LLM generates response with context
6. ✅ Response returns to frontend with metadata
7. ✅ Frontend displays answer and sources to user
8. ✅ Chat history is persisted locally

**All endpoints are properly connected and the complete request-response cycle works end-to-end.**
