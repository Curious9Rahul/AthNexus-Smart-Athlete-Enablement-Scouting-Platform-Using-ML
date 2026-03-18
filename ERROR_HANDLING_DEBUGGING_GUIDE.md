# 🛠️ Error Handling & Debugging Guide - AthNexus RAG Chatbot

## 🔴 The Error You're Seeing

```
POST localhost:5173/api/chat - 500 (Internal Server Error)
Error sending message: Error: Failed to get response from chatbot
```

### **Root Cause: Backend Not Running** ❌

The frontend tries to send requests to the backend on `localhost:8000`, but the backend server is not running.

---

## ✅ How to Fix (Immediate)

### **Step 1: Start the Backend Server**

In a new terminal (or the PowerShell terminal):

```bash
cd backend
python main.py
```

✅ You should see:
```
Uvicorn running on http://0.0.0.0:8000
Application startup complete
```

### **Step 2: Reload Frontend**

Go back to your browser at `http://localhost:5173` and refresh the page.

The "Connected" status should now appear and queries should work!

---

## 🔍 Common Errors & Solutions

### **Error 1: 500 Internal Server Error**

**What it looks like:**
```
Failed to load resource: the server responded with a status of 500 (Internal Server Error)
```

**Root Causes & Solutions:**

| Issue | Solution |
|-------|----------|
| Backend not running | `cd backend && python main.py` |
| Missing GROQ_API_KEY | Add to `backend/.env`: `GROQ_API_KEY=your_key` |
| Vector DB not initialized | Run: `python setup_vector_db.py` |
| Python dependency missing | Install: `pip install -r requirements.txt` |

---

### **Error 2: Cannot Connect to Backend**

**What it looks like:**
```
Error: Cannot connect to backend server on port 8000.
Start the backend: cd backend && python main.py
```

**Solution:**
```bash
# In a separate terminal
cd backend
python main.py
```

Check that you see:
```
Uvicorn running on http://0.0.0.0:8000 ✅
```

---

### **Error 3: GROQ_API_KEY Not Found**

**What it looks like:**
```
Backend service unavailable (503)
GROQ_API_KEY not found. Add it to backend/.env before starting the server.
```

**Solution:**

1. **Create/Edit `backend/.env`:**
```bash
# In backend folder, create or edit .env file
GROQ_API_KEY=gsk_xxxxxxxxxxxx
GROQ_MODEL=llama-3.1-8b-instant
```

2. **Restart Backend:**
```bash
cd backend
python main.py
```

---

### **Error 4: Invalid Request (422)**

**What it looks like:**
```
Invalid request format (422)
Make sure your question is not empty.
```

**Solution:**
- Don't send empty questions
- Make sure your message has content

---

### **Error 5: Vector Database Not Initialized**

**What it looks like:**
```
No vector database documents found
Vector DB has no documents
```

**Solution:**
```bash
cd backend
python setup_vector_db.py
```

You should see:
```
✓ Vector database initialization complete!

Documents added per collection:
  • sports_events: 6 documents
  • college_academics: 6 documents
  • training_guides: 5 documents
  • nutrition: 5 documents
```

---

## 🧪 Debugging Steps

### **Step 1: Check if Backend is Running**

```bash
curl http://localhost:8000/api/health
```

**Expected Response:**
```json
{
  "status": "ok",
  "provider_connected": true,
  "document_count": 22
}
```

**If it fails:** Backend is not running. Start it with `python main.py`

---

### **Step 2: Check API Configuration**

The frontend should forward `/api/` requests to `http://localhost:8000`.

**Check:** `app/vite.config.ts` has this:
```typescript
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:8000',
      changeOrigin: true,
    },
  },
},
```

✅ This is already configured!

---

### **Step 3: Check Frontend Console**

**Open DevTools:** `F12` or `Cmd+Option+I`

Look for:
- ✅ **Console tab**: Any JavaScript errors?
- ✅ **Network tab**: Click on the `/api/chat` request
  - Status code: Should be 200 OK (not 500)
  - Response: Should be JSON with `answer` field

---

### **Step 4: Check Backend Logs**

Watch the terminal where `python main.py` is running for error messages.

Look for patterns like:
```
ERROR: [details about what failed]
```

---

## 📋 Startup Checklist

Before using the chatbot, verify all these:

- [ ] **Python Virtual Environment Activated**
  ```bash
  # Windows
  .\.venv\Scripts\Activate.ps1
  # Mac/Linux
  source .venv/bin/activate
  ```

- [ ] **Backend Dependencies Installed**
  ```bash
  pip install -r backend/requirements.txt
  ```

- [ ] **GROQ_API_KEY Set** in `backend/.env`
  ```bash
  GROQ_API_KEY=your_actual_key
  ```

- [ ] **Vector Database Initialized**
  ```bash
  python backend/setup_vector_db.py
  ```

- [ ] **Backend Running** in Terminal 1
  ```bash
  cd backend
  python main.py
  # Should show: Uvicorn running on http://0.0.0.0:8000
  ```

- [ ] **Frontend Running** in Terminal 2
  ```bash
  cd app
  npm run dev
  # Should show: Local: http://localhost:5173
  ```

- [ ] **Health Check Passes**
  ```bash
  curl http://localhost:8000/api/health
  # Should return: status: "ok"
  ```

---

## 🔧 Detailed Terminal Setup

### **Terminal 1: Backend**
```bash
cd backend
python main.py
```

**Healthy Output:**
```
INFO:     Uvicorn running on http://0.0.0.0:8000
INFO:     Application startup complete
```

**Stay in this terminal and watch for errors.**

---

### **Terminal 2: Frontend**
```bash
cd app
npm run dev
```

**Healthy Output:**
```
> dev
> vite

  VITE v4.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  press h to show help
```

---

## 📊 Request-Response Debugging

### **What Happens When You Send a Message:**

1. **Frontend** (localhost:5173)
   - You type a question and press Send
   - `handleSendMessage()` is called ← Check browser console

2. **Vite Proxy** (localhost:5173)
   - Intercepts `/api/chat` request
   - Forwards to `http://localhost:8000/api/chat`

3. **Backend** (localhost:8000)
   - Receives request
   - Validates input
   - Calls RAG engine
   - Returns response

4. **Frontend** (localhost:5173)
   - Receives response
   - Displays answer in chat

### **Where to Look for Errors:**

| Error | Where to Check |
|-------|----------------|
| Frontend sending wrong data | Browser DevTools → Network tab |
| Backend not responding | Backend terminal logs |
| Groq API error | Backend terminal logs |
| Vector DB error | Backend terminal logs |

---

## 🐛 Enable Debug Mode

### **Frontend Debug Logging**

Add this to `app/src/services/ragChatService.ts`:

```typescript
async sendMessage(request: ChatRequest): Promise<ChatResponse> {
  console.log('📤 Sending request:', request)
  // ... rest of code
  console.log('📥 Received response:', data)  
  return data
}
```

---

### **Backend Debug Logging**

Add this to `backend/rag_engine.py`:

```python
def ask_ai(question: str):
  print(f"🔍 Processing question: {question}")
  sources = retrieve_sources(question)
  print(f"📚 Found {len(sources)} sources")
  # ... rest of code
  return {...}
```

---

## 🔄 Complete Restart

If things seem broken, restart everything:

### **Step 1: Stop Everything**
- Close both terminals
- Close browser

### **Step 2: Start Fresh**

**Terminal 1:**
```bash
cd backend
rm -rf vector_db  # (optional: clean up)
python setup_vector_db.py
python main.py
```

**Terminal 2:**
```bash
cd app
npm run dev
```

**Browser:**
```
http://localhost:5173
```

---

## ✅ Success Indicators

When everything is working:

✅ Backend showing:
```
Uvicorn running on http://0.0.0.0:8000
Application startup complete
```

✅ Frontend showing:
```
vite ready in XXX ms
Local: http://localhost:5173
```

✅ Browser showing:
```
AI Assistant page loads
"Connected" status appears (green checkmark)
```

✅ Sending a message shows:
```
Answer appears in chat
Sources displayed
No errors in console
```

---

## 🎯 Quick Fix Flowchart

```
Error received?
    ↓
Check: Is backend running?
    ├─ NO  → Start: cd backend && python main.py
    └─ YES → Continue
    ↓
Check: Backend logs for errors
    ├─ GROQ_API_KEY error → Add to .env
    ├─ Vector DB error → Run setup_vector_db.py
    ├─ Import error → pip install -r requirements.txt
    └─ NO ERRORS → Continue
    ↓
Check: Browser console errors
    ├─ Network tab shows 500 → Restart backend
    ├─ 503 error → GROQ_API_KEY issue
    └─ NO ERRORS → Should be working!
    ↓
Try sending message again
    ├─ Works! → 🎉 All fixed
    └─ Still broken → See "Detailed Terminal Setup"
```

---

## 📞 Getting Help

1. **Check error message** → See section above for that error
2. **Check terminal output** → Look for which component failed
3. **Read logs** → Backend and frontend logs tell the story
4. **Check checklist** → Did you install everything?
5. **Restart everything** → Often fixes miscellaneous issues

---

## 🚀 You're Ready!

Once all checks pass, the chatbot should work perfectly:

```
User: "What are NCAA GPA requirements?"
    ↓
Frontend → Backend → Vector DB → Groq LLM
    ↓
"Division 1 athletes need a minimum 2.3 GPA..."
```

**No more 500 errors!** ✨

---

**Created:** March 2024  
**For:** AthNexus RAG Chatbot  
**Status:** Complete Error Handling Guide Ready
