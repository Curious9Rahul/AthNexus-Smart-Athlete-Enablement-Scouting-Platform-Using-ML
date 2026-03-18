"""
API CONNECTION VERIFICATION & TESTING GUIDE
AthNexus RAG Chatbot - Request Flow Analysis
"""

# ==============================================================================
# REQUEST FLOW ARCHITECTURE
# ==============================================================================

"""
1. USER SENDS QUERY (Frontend - AIAssistant.tsx)
   ↓
   - User types message in chat input
   - Clicks "Send" or presses Enter
   - handleSendMessage() triggered
   
2. FRONTEND CALLS API ENDPOINT
   ↓
   - Service: ragChatService.sendMessage()
   - Endpoint: POST /api/chat
   - URL: ${API_BASE_URL}/chat (default: /api)
   - Headers: Content-Type: application/json
   - Body: { "question": "user message" }
   
3. BACKEND RECEIVES REQUEST (main.py)
   ↓
   - Route: @app.post("/chat") or @app.post("/api/chat")
   - Controller: chat(req: ChatRequest)
   - Extracts prompt from request
   - Validates input (must not be empty)
   
4. BACKEND PROCESSES REQUEST (rag_engine.py)
   ↓
   - Function: ask_ai(question: str)
   - Initializes vector database
   - Searches for relevant sources
   - Creates context from retrieved documents
   - Sends to Groq LLM with system prompt
   
5. MODEL GENERATES RESPONSE (Groq API)
   ↓
   - Model: llama-3.1-8b-instant
   - Input: Prompt with context + question
   - Output: Generated answer
   
6. RESPONSE SENT BACK TO FRONTEND
   ↓
   - Status: 200 OK
   - Body: ChatResponse object
   {
     "answer": "AI generated answer",
     "sources": [...],
     "confidence": 0.92,
     "retrieval_time_ms": 145
   }
   
7. FRONTEND DISPLAYS RESULT (AIAssistant.tsx)
   ↓
   - Adds assistant message to chat
   - Displays answer to user
   - Shows source documents
   - Saves to localStorage
"""

# ==============================================================================
# VERIFICATION CHECKLIST
# ==============================================================================

VERIFICATION_CHECKLIST = {
    "Frontend Integration": {
        "✓ ragChatService.sendMessage()": "Sends POST to /api/chat",
        "✓ ChatRequest model": "Has question, message, user_id, sport fields",
        "✓ AIAssistant component": "Calls service and displays response",
        "✓ Error handling": "Catches exceptions and displays errors",
        "✓ Loading state": "Shows loading spinner while processing",
        "✓ Chat history": "Saves/loads from localStorage",
    },
    
    "Backend API (main.py)": {
        "✓ POST /api/chat": "Receives ChatRequest",
        "✓ Input validation": "Checks prompt is not empty",
        "✓ Error handling": "Returns HTTP errors with messages",
        "✓ CORS middleware": "Allows cross-origin requests",
        "✓ JSON serialization": "Uses Pydantic models",
    },
    
    "RAG Engine (rag_engine.py)": {
        "✓ ask_ai() function": "Main processing function",
        "✓ Vector DB integration": "Searches semantic embeddings",
        "✓ Fallback mechanism": "Falls back to keyword search",
        "✓ Context creation": "Builds prompt with sources",
        "✓ Groq integration": "Sends to LLM model",
        "✓ Response formatting": "Returns ChatResponse structure",
    },
    
    "Vector Database (vector_db.py)": {
        "✓ Collections": "4 collections created (events, academics, training, nutrition)",
        "✓ Embeddings": "Generated automatically",
        "✓ Persistence": "Stored in vector_db/ directory",
        "✓ Search function": "search_all_collections()",
    },
    
    "Configuration": {
        "✓ GROQ_API_KEY": "Set in backend/.env",
        "✓ API_BASE_URL": "Frontend points to /api",
        "✓ Port 8000": "Backend runs on localhost:8000",
        "✓ CORS enabled": "Frontend can reach backend",
    }
}

# ==============================================================================
# TESTING THE COMPLETE FLOW
# ==============================================================================

"""
OPTION 1: Test with cURL (Command Line)
"""

# 1. Check backend is running and connected
curl -X GET http://localhost:8000/api/health

# Response should include:
# "status": "ok"
# "provider_connected": true
# "document_count": > 0

# 2. Send a test query
curl -X POST http://localhost:8000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"question": "What are NCAA GPA requirements?"}'

# Expected Response:
# {
#   "answer": "Division 1 athletes need a minimum 2.3 GPA...",
#   "sources": [...],
#   "confidence": 0.92,
#   "retrieval_time_ms": 145.32
# }

"""
OPTION 2: Test with Python
"""

import requests

# Test endpoint connectivity
def test_api_connection():
    # Check health
    health = requests.get('http://localhost:8000/api/health').json()
    print(f"Backend Status: {health['status']}")
    print(f"Provider Connected: {health['provider_connected']}")
    print(f"Document Count: {health['document_count']}")
    
    # Send query
    response = requests.post(
        'http://localhost:8000/api/chat',
        json={"question": "What should I eat before a competition?"}
    ).json()
    
    print(f"Answer: {response['answer']}")
    print(f"Confidence: {response['confidence']}")
    print(f"Sources Found: {len(response['sources'])}")
    
    return response

"""
OPTION 3: Test with Browser DevTools
"""

# Open browser console and run:

fetch('/api/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ question: 'How do I balance sports and academics?' })
})
.then(res => res.json())
.then(data => console.log('Response:', data))
.catch(err => console.error('Error:', err))

# ==============================================================================
# API ENDPOINTS SUMMARY
# ==============================================================================

ENDPOINTS = {
    "Chat with RAG": {
        "method": "POST",
        "path": "/api/chat",
        "request": {
            "question": "string (required)",
            "message": "string (optional, alternative to question)",
            "user_id": "string (optional)",
            "sport": "string (optional)"
        },
        "response": {
            "answer": "generated response",
            "sources": [
                {
                    "content": "relevant document",
                    "similarity_score": 0.92,
                    "collection": "college_academics"
                }
            ],
            "confidence": "float 0-1",
            "retrieval_time_ms": "number"
        }
    },
    
    "Health Check": {
        "method": "GET",
        "path": "/api/health",
        "response": {
            "status": "ok|degraded|error",
            "provider_connected": "boolean",
            "document_count": "number",
            "vector_db_ready": "boolean"
        }
    },
    
    "System Info": {
        "method": "GET",
        "path": "/api/rag/info",
        "response": {
            "system": "AthNexus AI Backend",
            "status": "ok|degraded|error",
            "vector_db_stats": {
                "sports_events": { "document_count": 6 },
                "college_academics": { "document_count": 6 },
                "training_guides": { "document_count": 5 },
                "nutrition_advice": { "document_count": 5 }
            }
        }
    },
    
    "Vector Search": {
        "method": "POST",
        "path": "/api/vector-db/search",
        "request": {
            "query": "search text",
            "top_k": "number (default 4)"
        },
        "response": {
            "query": "input query",
            "results": [
                {
                    "content": "document text",
                    "similarity_score": 0.92,
                    "collection": "collection_name"
                }
            ],
            "count": "number of results"
        }
    },
    
    "List Documents": {
        "method": "GET",
        "path": "/api/documents/list"
    },
    
    "Upload Document": {
        "method": "POST",
        "path": "/api/documents/upload",
        "request": "multipart/form-data with file"
    }
}

# ==============================================================================
# RESPONSE FLOW VERIFICATION
# ==============================================================================

RESPONSE_FLOW = """
1. Frontend sends: POST /api/chat with question
2. Backend receives in main.py chat() endpoint
3. chat() calls rag_engine.ask_ai(question)
4. ask_ai() calls vector_db.search_all_collections(question)
5. Vector DB returns semantic search results
6. rag_engine.ask_ai() builds context from results
7. ask_ai() sends to Groq LLM API
8. Groq returns generated answer
9. ask_ai() formats ChatResponse with answer + sources
10. main.py returns 200 OK with ChatResponse JSON
11. Frontend receives response
12. Frontend displays answer in chat
13. Frontend shows sources
14. Frontend saves to localStorage
"""

# ==============================================================================
# ERROR HANDLING VERIFICATION
# ==============================================================================

ERROR_SCENARIOS = {
    "Empty Question": {
        "Backend returns": "422 Unprocessable Entity",
        "Error message": "A message or question is required",
        "Frontend displays": "Error banner"
    },
    
    "Backend Not Running": {
        "Frontend detects": "Connection refused",
        "Error message": "AI backend is not available right now",
        "UI shows": "Offline status, warning banner"
    },
    
    "Missing GROQ_API_KEY": {
        "Backend returns": "503 Service Unavailable",
        "Error message": "GROQ_API_KEY not found",
        "Frontend displays": "Error message to user"
    },
    
    "Network Error": {
        "Frontend catches": "Fetch error",
        "Error message": "Failed to get response from chatbot",
        "Frontend displays": "Error message in chat"
    }
}

# ==============================================================================
# DEBUGGING TIPS
# ==============================================================================

DEBUGGING_TIPS = """
1. CHECK BACKEND IS RUNNING:
   curl http://localhost:8000/api/health
   Should return 200 OK with status

2. CHECK VECTOR DATABASE:
   curl http://localhost:8000/api/vector-db/stats
   Should show 4 collections with documents

3. CHECK BROWSER CONSOLE:
   Open DevTools → Console tab
   Look for network errors or JavaScript errors

4. CHECK BACKEND LOGS:
   Monitor terminal where python main.py is running
   Look for error messages

5. CHECK REQUEST/RESPONSE IN NETWORK TAB:
   Open DevTools → Network tab
   Look for /api/chat request
   Check Status Code and Response body

6. TEST ENDPOINT DIRECTLY:
   curl -X POST http://localhost:8000/api/chat \
     -H "Content-Type: application/json" \
     -d '{"question": "test"}'

7. CHECK GROQ API:
   Verify GROQ_API_KEY is valid
   Check GROQ_MODEL setting in .env

8. CHECK VECTOR DATABASE:
   python setup_vector_db.py
   Should initialize without errors
"""

# ==============================================================================
# CONNECTION STATUS INDICATORS
# ==============================================================================

"""
SUCCESS SIGNS:
✓ Chat interface shows "Connected" status
✓ Messages appear in chat after sending
✓ "Thinking..." shows while waiting
✓ Answer displays with sources
✓ No error messages in console

FAILURE SIGNS:
✗ Chat shows "Offline" status
✗ Error banner appears at top
✗ No response after sending message
✗ 404/503/500 errors in Network tab
✗ Console shows fetch errors
✗ "Failed to get response" message
"""

# ==============================================================================
# COMPLETE WORKING SETUP
# ==============================================================================

"""
STEP 1: Setup & Dependencies
pip install -r requirements.txt

STEP 2: Initialize Vector Database
python setup_vector_db.py

STEP 3: Start Backend Server
python main.py
Expected: "Uvicorn running on http://0.0.0.0:8000"

STEP 4: Start Frontend (if not already running)
cd app
npm run dev
Expected: "http://localhost:5173"

STEP 5: Test in Browser
- Navigate to http://localhost:5173
- Go to AI Assistant page
- Verify "Connected" status
- Type a question
- Press Send
- Should see response with sources

If all steps complete, connection is properly configured!
"""

print("API Connection Verification Document Ready!")
