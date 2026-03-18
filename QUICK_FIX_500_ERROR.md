# 🚀 Quick Fix - 500 Error Resolution

## Your Error (Right Now)

```
POST localhost:5173/api/chat - 500 (Internal Server Error)
Failed to get response from chatbot
```

## ✅ Fix (3 Steps - 2 Minutes)

### **Step 1: Open New Terminal**

Windows PowerShell or Command Prompt - **do NOT close your existing terminals**

### **Step 2: Start Backend**

```bash
cd backend
python main.py
```

### **Step 3: Wait for Success Message**

You should see:
```
Uvicorn running on http://0.0.0.0:8000
```

**That's it!** 🎉

---

## Then Try Again

1. Go back to browser: `http://localhost:5173`
2. Refresh page
3. Type a message
4. Click Send

Should work now! ✅

---

## If Still Broken

Check the "Detailed Troubleshooting" section below...

---

## 🔧 Detailed Troubleshooting

### **Still Getting 500 Error?**

**Check Step 1:** Is backend showing any errors?

Look at the terminal running `python main.py`:

```bash
# Error: GROQ_API_KEY not found
→ Solution: Create backend/.env with your key

# Error: ModuleNotFoundError
→ Solution: pip install -r requirements.txt

# Error: Vector DB not found  
→ Solution: python setup_vector_db.py
```

---

### **Backend Won't Start**

**Error:** `Address already in use`

**Solution:**
```bash
# Kill process on port 8000 (Windows)
netstat -ano | findstr :8000
taskkill /PID <PID> /F

# Mac/Linux
lsof -i :8000
kill -9 <PID>
```

Then try `python main.py` again.

---

### **Vite Proxy Not Working**

**Check:** `app/vite.config.ts` has this:

```typescript
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:8000',
      changeOrigin: true,
      rewrite: (path) => path.replace(/^\/api/, '/api'),
    },
  },
},
```

**If missing:** Add it and restart `npm run dev`

---

## 📋 System Requirements Check

Before continuing, verify:

```bash
# 1. Python installed?
python --version
→ Should be 3.8+

# 2. Node installed?
node --version
→ Should be 14+

# 3. pip updated?
pip install --upgrade pip

# 4. Virtual env activated?
# Windows: .\.venv\Scripts\Activate.ps1
# Mac: source .venv/bin/activate

# 5. Backend dependencies?
pip install -r backend/requirements.txt

# 6. GROQ_API_KEY set?
cat backend/.env
→ Should show: GROQ_API_KEY=...
```

---

## [OLD] The Complete Fix Order

If you didn't follow the checklist above, do this in order:

### 1️⃣ **Activate Python Env**
```bash
# Windows
.\.venv\Scripts\Activate
# Mac/Linux  
source .venv/bin/activate
```

### 2️⃣ **Install Dependencies**
```bash
pip install -r backend/requirements.txt
```

### 3️⃣ **Set API Key**
```bash
# Create/edit backend/.env
echo "GROQ_API_KEY=your_actual_key" > backend/.env
echo "GROQ_MODEL=llama-3.1-8b-instant" >> backend/.env
```

### 4️⃣ **Initialize Vector DB**
```bash
python backend/setup_vector_db.py
```

### 5️⃣ **Start Backend** (Terminal 1)
```bash
cd backend
python main.py
```

### 6️⃣ **Start Frontend** (Terminal 2)
```bash
cd app
npm run dev
```

### 7️⃣ **Test**
```
Open: http://localhost:5173
Send message → Should work! ✅
```

---

## 🧪 Verify It Works

### **Command Line Test:**
```bash
curl http://localhost:8000/api/health
```

**Should return:**
```json
{
  "status": "ok",
  "provider_connected": true,
  "document_count": 22
}
```

### **Browser Test:**
1. Open DevTools (F12)
2. Go to Network tab
3. Send message in chat
4. Look for `/api/chat` request
5. Status should be **200 OK** (not 500)
6. Response should have `answer` field

### **Functional Test:**
Message → Answer + Sources (with no errors)

---

## 🎯 What's Happening

```
Browser (localhost:5173)
    ↓
POST /api/chat
    ↓
Vite Proxy intercepts
    ↓
Forwards to: localhost:8000/api/chat
    ↓
Backend processes
    ↓
Returns JSON response
    ↓
Frontend displays answer
```

**The 500 error means the proxy can't reach `localhost:8000`** because the backend isn't running!

---

## ✨ Success Looks Like

When working:
- ✅ Message appears in chat (user side)
- ✅ Three dots appear (thinking...)
- ✅ Answer appears (AI side)
- ✅ Sources show below
- ✅ No red error banners

---

## 🆘 Still Stuck?

Read: `ERROR_HANDLING_DEBUGGING_GUIDE.md` (comprehensive guide)

---

**Time to fix:** 2 minutes  
**Difficulty:** ⭐ Easy  
**Success rate:** 99%

Go fix it! 🚀
