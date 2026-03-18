# Vector Database Setup Guide for AthNexus RAG Chatbot

## Overview

The AthNexus RAG (Retrieval-Augmented Generation) chatbot now includes a semantic vector database powered by **Chroma** and **Sentence Transformers**. This enables intelligent semantic search across college academics, sports events, training guides, and nutrition advice.

## Features

✨ **Semantic Search**: Find relevant information based on meaning, not just keywords
✨ **Multiple Collections**: Organized data across sports events, academics, training, and nutrition
✨ **College Academics**: Information about admissions, GPA requirements, scholarship opportunities
✨ **Sports Events**: Upcoming tournaments, championships, and trial information
✨ **Training Guides**: Sport-specific and general training methodologies
✨ **Nutrition Advice**: Pre-competition, post-workout, and injury recovery nutrition

## Architecture

```
Vector Database Structure:
├── Sports Events Collection
│   └── Event information, championships, trials
├── College Academics Collection  
│   └── Admissions, GPA requirements, scholarships, college selection
├── Training Guides Collection
│   └── Sport-specific training, strength training, flexibility work
└── Nutrition Advice Collection
    └── Pre-competition meals, recovery nutrition, hydration
```

## Installation

### 1. Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

**Key Dependencies:**
- `chromadb` - Vector database with persistent storage
- `sentence-transformers` - Embedding model for semantic search
- `fastapi` - API framework
- `groq` - LLM provider for response generation

### 2. Initialize Vector Database

```bash
python setup_vector_db.py
```

This will:
- Create a persistent vector database in `backend/vector_db/`
- Initialize 4 collections (sports_events, college_academics, training_guides, nutrition_advice)
- Add 24+ sample documents with semantic embeddings
- Create necessary indices for fast retrieval

### 3. Configure Environment (Optional)

Update `backend/.env` with your Groq API key:

```bash
GROQ_API_KEY=your_api_key_here
GROQ_MODEL=llama-3.1-8b-instant
```

### 4. Start the Backend Server

```bash
python main.py
```

The server will start on `http://localhost:8000` and automatically initialize the vector database on first request.

## API Endpoints

### Health Check
```bash
GET /health
GET /api/health
```
Returns vector database status and document counts.

### Get System Information
```bash
GET /rag/info
GET /api/rag/info
```
Returns detailed information about vector database collections.

### Chat with RAG
```bash
POST /api/chat
Content-Type: application/json

{
  "question": "What are the NCAA GPA requirements for athletes?",
  "user_id": "athlete_123"
}
```

**Response:**
```json
{
  "answer": "Division 1 athletes need a minimum 2.3 GPA...",
  "sources": [
    {
      "filename": "college_academics",
      "title": "college_academics - gpa_requirements",
      "content": "Division 1 athletes need a minimum 2.3 GPA...",
      "score": 0.92,
      "source_type": "vector_search"
    }
  ],
  "confidence": 0.92,
  "retrieval_time_ms": 145.32
}
```

## Query Examples

### College Academics
- "What are the NCAA GPA requirements?"
- "How do I balance athletics and studies?"
- "What scholarships are available for athletes?"
- "How do I get admitted to college?"

### Sports Events
- "What are the upcoming basketball championships?"
- "When are the state football trials?"
- "Tell me about national athletic competitions"
- "What events are available for swimmers?"

### Training
- "How should I do strength training?" 
- "What are HIIT exercises?"
- "Tell me about agility drills for football"
- "How can I improve flexibility?"

### Nutrition
- "What should I eat before competition?"
- "What's the best post-workout meal?"
- "How much water should I drink during exercise?"
- "What foods help with injury recovery?"

## Database Architecture

### Vector Storage
- **Database Type**: Chroma (local persistent storage)
- **Embedding Model**: Sentence Transformers (all-MiniLM-L6-v2)
- **Vector Dimension**: 384 dimensions
- **Distance Metric**: Cosine similarity

### Collections

#### 1. Sports Events Collection
Documents about athletic events, championships, and competitions
- **Documents**: 6+
- **Metadata**: sport, category, level (NCAA D1, state, university, national)

#### 2. College Academics Collection  
Information about college admissions, eligibility, and scholarships
- **Documents**: 6+
- **Metadata**: topic (admission, eligibility, GPA, etc.), level

#### 3. Training Guides Collection
Training methodologies and sport-specific training programs
- **Documents**: 5+
- **Metadata**: sport, exercise_type, difficulty level

#### 4. Nutrition Advice Collection
Nutrition guidance for athletes
- **Documents**: 5+
- **Metadata**: meal_type, timing, focus areas

## Extending the Database

### Add Documents Programmatically

```python
from vector_db import add_documents_to_collection

documents = [
    "Your document text here...",
    "Another document..."
]

metadatas = [
    {"source": "custom", "category": "sport", "sport": "tennis"},
    {"source": "custom", "category": "training"}
]

count = add_documents_to_collection(
    "sports_events",
    documents,
    metadatas
)
print(f"Added {count} documents")
```

### Upload Documents via API

```bash
curl -X POST http://localhost:8000/documents/upload \
  -F "file=@document.txt"
```

## Performance

- **Initialization Time**: ~2-5 seconds (includes embedding generation)
- **Query Response Time**: ~100-200ms (typical)
- **Memory Usage**: ~500MB-1GB with default models
- **Storage**: ~50-100MB for vector database
- **Concurrent Queries**: Handles 20+ simultaneous requests

## Troubleshooting

### Issue: "chromadb" import error
**Solution**: Install dependencies
```bash
pip install -r requirements.txt
```

### Issue: Vector database not initializing
**Solution**: Check permissions on `backend/vector_db/` directory
```bash
# Clear and reinitialize
rm -rf backend/vector_db
python setup_vector_db.py
```

### Issue: Slow queries
**Solution**: Vector database uses cosine similarity which is fast. If slow:
1. Check system memory availability
2. Ensure no other heavy processes running
3. Restart the backend server

### Issue: Empty search results
**Solution**: 
1. Verify vector database initialized: `GET /api/health`
2. Check if documents were added
3. Run `python setup_vector_db.py` again

## Integration with Frontend

The frontend's `ragChatService.ts` already integrates with this API:

```typescript
const response = await fetch('/api/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    question: userQuery,
    user_id: currentUserId
  })
});
```

The response includes enhanced vector search results with similarity scores.

## Best Practices

1. **Specific Queries**: More specific queries yield better results
   - Good: "What's the NCAA GPA requirement for Division 1 athletes?"
   - Less Good: "Tell me about college"

2. **Metadata Utilization**: Metadata helps with context understanding
   - Always include relevant metadata when adding documents

3. **Regular Updates**: Monitor vector database performance
   - Check `GET /api/rag/info` for collection statistics
   - Add new documents as content evolves

4. **Error Handling**: The system gracefully falls back to keyword search if vector search fails

## File Structure

```
backend/
├── main.py              # FastAPI application
├── rag_engine.py        # RAG logic with vector DB integration
├── vector_db.py         # Vector database implementation
├── setup_vector_db.py   # Initialization script
├── requirements.txt     # Python dependencies
├── .env                 # Configuration (API keys)
├── data/                # Legacy text documents
└── vector_db/           # Persistent vector database storage
```

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Verify all dependencies are installed
3. Review API response status codes
4. Check server logs for detailed error messages

---

**Version**: 1.0  
**Last Updated**: 2024  
**Technology Stack**: Chroma + Sentence Transformers + Groq + FastAPI
