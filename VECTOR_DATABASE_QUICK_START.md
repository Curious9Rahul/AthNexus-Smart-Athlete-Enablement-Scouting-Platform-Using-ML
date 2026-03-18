# Vector Database Quick Start Guide

## ⚡ Quick Setup (5 minutes)

### Step 1: Install Dependencies
```bash
cd backend
pip install -r requirements.txt
```

### Step 2: Initialize Vector Database
```bash
python setup_vector_db.py
```

You should see output like:
```
============================================================
AthNexus Vector Database Setup
============================================================

Initializing vector database with sample data...

✓ Vector database initialization complete!

Documents added per collection:
  • sports_events: 6 documents
  • college_academics: 6 documents
  • training_guides: 5 documents
  • nutrition: 5 documents
```

### Step 3: Start Backend Server
```bash
python main.py
```

Server will start on `http://localhost:8000`

## 🧪 Test the Vector Database

### Option 1: Using cURL

**Test Health Status:**
```bash
curl http://localhost:8000/api/health
```

**Test Vector Search:**
```bash
curl -X POST http://localhost:8000/api/vector-db/search \
  -H "Content-Type: application/json" \
  -d '{"query": "college GPA requirements", "top_k": 3}'
```

**Test RAG Chat:**
```bash
curl -X POST http://localhost:8000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"question": "What are the NCAA GPA requirements?"}'
```

### Option 2: Using Python

```python
import requests

# Initialize vector database
response = requests.post('http://localhost:8000/api/vector-db/init')
print(response.json())

# Get stats
response = requests.get('http://localhost:8000/api/vector-db/stats')
print(response.json())

# Search vector database
response = requests.post(
    'http://localhost:8000/api/vector-db/search',
    json={"query": "college academics", "top_k": 4}
)
print(response.json())

# Chat with RAG
response = requests.post(
    'http://localhost:8000/api/chat',
    json={"question": "What should I eat before a competition?"}
)
print(response.json())
```

## 📊 Vector Database Collections

The system includes 4 semantic search collections:

### 1. **Sports Events** 
For information about competitions, championships, trials
- Query: "What tournaments are coming up?"
- Query: "Tell me about basketball championships"

### 2. **College Academics**
For college admission, GPA requirements, scholarships
- Query: "What are NCAA GPA requirements?"
- Query: "How do I balance sports and academics?"

### 3. **Training Guides**
For training programs, exercises, sport-specific techniques
- Query: "How should I do strength training?"
- Query: "What are agility drills for football?"

### 4. **Nutrition Advice**
For pre-competition, post-workout, and recovery nutrition
- Query: "What should I eat before a game?"
- Query: "What's best for post-workout recovery?"

## 🔍 Example Queries

```bash
# Get NCAA eligibility info
curl -X POST http://localhost:8000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"question": "What are NCAA eligibility requirements?"}'

# Get training advice
curl -X POST http://localhost:8000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"question": "Tell me about HIIT training"}'

# Get nutrition guidance
curl -X POST http://localhost:8000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"question": "What should I eat before competition?"}'

# Get event information
curl -X POST http://localhost:8000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"question": "What sports events are available?"}'
```

## 📁 New Files Created

- **`vector_db.py`** - Core vector database implementation using Chroma
- **`setup_vector_db.py`** - Initialization script with sample data
- **`requirements.txt`** - Python dependencies including Chroma and Sentence Transformers
- **`VECTOR_DATABASE_SETUP.md`** - Comprehensive documentation
- **`VECTOR_DATABASE_QUICK_START.md`** - This file

## 🔧 Modified Files

- **`rag_engine.py`** - Integrated vector search with fallback to keyword search
- **`main.py`** - Added vector database API endpoints

## 🎯 Key Features

✅ **Semantic Search** - Finds relevant information by meaning, not keywords
✅ **4 Collections** - Organized data across different topics
✅ **24+ Sample Documents** - Pre-loaded with college and sports content
✅ **Fallback Mechanism** - Gracefully falls back to keyword search if needed
✅ **Collection Statistics** - Monitor database status via API
✅ **Direct Search API** - Test vector search without RAG
✅ **Persistent Storage** - Vector database saved locally

## 📈 Next Steps

1. **Connect Frontend**: Update `src/services/ragChatService.ts` to use `/api/chat` endpoint
2. **Add More Documents**: Use `/api/documents/upload` to add custom files
3. **Fine-tune Embeddings**: Consider using specialized embedding models for sports domain
4. **Monitor Performance**: Check `/api/vector-db/stats` regularly

## 🚀 What's Different Now?

**Before:** Keyword-based retrieval (fast but limited context understanding)
**After:** Semantic vector search (understands meaning, better results)

The system will:
1. **Search semantically** using vector embeddings first
2. **Return relevant results** based on meaning similarity
3. **Fall back to keywords** if vector search unavailable
4. **Generate AI response** using Groq LLM
5. **Return sources** with similarity scores

## 📞 Support

If you encounter issues:
1. Ensure all dependencies installed: `pip install -r requirements.txt`
2. Check that vector database initialized: `python setup_vector_db.py`
3. Verify backend running: `python main.py`
4. Check API is responding: `curl http://localhost:8000/api/health`

---

**Version**: 1.0  
**Last Updated**: March 2024
