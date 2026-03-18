# AthNexus RAG Chatbot - Setup and Run Guide

## Overview

The AthNexus RAG Chatbot is a LangChain-based system that enables college athletes to ask questions about training, recovery, nutrition, injury prevention, and academics. The system uses OpenAI LLM for intelligent responses grounded in a knowledge base.

**Architecture:**
- **Frontend**: React app with floating chatbot component
- **Backend**: Express.js server with LangChain RAG implementation
- **Vector DB**: In-memory vector store with OpenAI embeddings
- **Knowledge Base**: 6 comprehensive markdown documents

---

## Quick Start (30 minutes)

### Prerequisites

- Node.js 16+ and npm
- OpenAI API key (get from https://platform.openai.com/api-keys)

### Step 1: Set Up Backend

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env and add your OpenAI API key
# OPENAI_API_KEY=sk-your-key-here
```

### Step 2: Start Backend Server

```bash
# From backend directory
npm run dev
```

You should see:
```
✨ AthNexus RAG Backend running on http://localhost:5000
📚 Knowledge base path: ./knowledge-base
📖 Loaded documents: 6
```

### Step 3: Start Frontend (in another terminal)

```bash
# Navigate to frontend directory
cd app

# Install dependencies (if not already done)
npm install

# Set backend URL (optional, defaults to http://localhost:5000)
export REACT_APP_API_URL=http://localhost:5000/api

# Start development server
npm run dev
```

### Step 4: Test the Chatbot

1. Open the app in your browser (usually http://localhost:5173)
2. Click the green floating chatbot button (bottom right)
3. Ask a question like: "What should I eat before a soccer match?"
4. The chatbot should return a response with source documents

---

## Detailed Setup Instructions

### Backend Setup

#### 1. Project Structure

The backend directory structure:

```
backend/
├── src/
│   ├── index.ts              # Express server entry point
│   ├── config/
│   │   └── rag.ts           # RAG initialization
│   ├── routes/
│   │   └── chat.ts          # Chat endpoint
│   ├── services/
│   │   ├── ragService.ts    # LangChain RAG logic
│   │   ├── vectorStore.ts   # Vector store
│   │   └── documentLoader.ts # Document loading
│   ├── types/
│   │   └── index.ts         # TypeScript types
│   └── utils/
│       └── validators.ts    # Input validation
├── package.json
├── tsconfig.json
├── .env
└── .env.example
```

#### 2. Installation

```bash
cd backend
npm install
```

**Key dependencies:**
- `express`: HTTP server framework
- `langchain`: RAG orchestration
- `@langchain/openai`: OpenAI integration
- `cors`: Cross-origin requests
- `dotenv`: Environment variables
- `typescript`: Type checking

#### 3. Configuration

Create `.env` file:

```bash
cp .env.example .env
```

Edit `.env`:

```env
# Required
OPENAI_API_KEY=sk-your-api-key-here

# Optional
PORT=5000
KB_PATH=./knowledge-base
```

**Get OpenAI API Key:**
1. Go to https://platform.openai.com/api-keys
2. Click "Create new secret key"
3. Copy the key
4. Paste into `.env` file

#### 4. Start Backend

```bash
npm run dev
```

**Available NPM scripts:**
- `npm run dev`: Development with auto-reload (uses tsx)
- `npm run build`: Compile TypeScript to JavaScript
- `npm start`: Run compiled backend
- `npm run typecheck`: Check TypeScript types

**Troubleshooting:**

| Issue | Solution |
|-------|----------|
| "OPENAI_API_KEY is not set" | Make sure `.env` file has your key |
| "Knowledge base not found" | The system creates an empty folder—place `.md` files in `knowledge-base/` |
| Port 5000 already in use | Change PORT in `.env` or kill process using port |
| Connection timeout | Make sure server is running before starting frontend |

---

### Frontend Setup

#### 1. Configuration

The frontend automatically connects to the backend at `http://localhost:5000/api`.

To change the URL, set environment variable before starting:

**Linux/Mac:**
```bash
export REACT_APP_API_URL=http://localhost:5000/api
npm run dev
```

**Windows (PowerShell):**
```powershell
$env:REACT_APP_API_URL="http://localhost:5000/api"
npm run dev
```

**Windows (CMD):**
```cmd
set REACT_APP_API_URL=http://localhost:5000/api
npm run dev
```

#### 2. Using the Chatbot

**Opening the Chatbot:**
- Click the green floating button (bottom right) labeled with a message icon
- Close it by clicking the X button

**Asking Questions:**
- Type your question in the input box
- Press Enter or click the Send button
- Wait for the response (usually 2-5 seconds)

**Viewing Sources:**
- Response includes source documents below the answer
- Shows which knowledge base document was used
- Helps verify answers are grounded in knowledge base

**Example Questions:**
1. "What should I eat before a football match?"
2. "How can I prevent hamstring strains?"
3. "What's the best way to recover after intense training?"
4. "How do I balance academics with 20 hours of training per week?"
5. "What's the optimal sleep duration for athletes?"

**Error Handling:**
- If backend is offline: Shows "Backend offline" warning
- If question is invalid: Shows error message with reason
- If LLM fails: Shows friendly error and suggests retry

---

## Knowledge Base Management

### Knowledge Base Structure

Documents are located in `knowledge-base/` directory:

```
knowledge-base/
├── 01-training-fundamentals.md
├── 02-recovery-protocols.md
├── 03-nutrition-for-athletes.md
├── 04-injury-prevention.md
├── 05-college-athlete-balance.md
└── 06-sports-science-research.md
```

### Adding Documents

1. Create a new Markdown file in `knowledge-base/` directory
2. Name it with a number prefix (e.g., `07-mental-performance.md`)
3. Format content with clear headings and sections
4. Restart backend server

**Markdown Format Example:**

```markdown
# Main Topic

## Subtopic 1

Explanation and details here.

### Sub-section

More specific information.

## Subtopic 2

Another section of content.
```

### Best Practices for Documents

- **Use clear headings**: Helps with retrieval (`# Main`, `## Sub`, `### Details`)
- **Keep paragraphs focused**: One idea per paragraph
- **Use lists for multiple items**: Easier for RAG to extract
- **Include practical examples**: Real-world scenarios help answering questions
- **Cite sources**: Adds credibility ("Research shows...", "Studies indicate...")
- **Keep technical accuracy**: RAG only grounds in what's provided

### Updating Documents

To update existing documents:

1. Edit the Markdown file
2. Save changes
3. Restart backend server
4. Vector store will reload automatically

---

## API Reference

### Chat Endpoint

**POST /api/chat**

Send a question and receive an answer grounded in knowledge base.

**Request:**
```json
{
  "question": "What should I eat before a 10K run?"
}
```

**Response:**
```json
{
  "answer": "For a 10K run, eat 1-2 hours before...",
  "sources": [
    {
      "title": "Pre-Competition Nutrition",
      "content": "3-4 Hours Before Competition...",
      "score": 0.95,
      "source_file": "03-nutrition-for-athletes.md"
    }
  ],
  "confidence": 0.85
}
```

**Error Response:**
```json
{
  "error": "Question cannot be empty"
}
```

### Health Check Endpoint

**GET /api/chat/health**

Check if server is running and documents loaded.

**Response:**
```json
{
  "status": "ok",
  "documentCount": 6,
  "timestamp": "2024-03-14T10:30:00Z"
}
```

---

## Development & Troubleshooting

### Running Both Servers Together

**Terminal 1 (Backend):**
```bash
cd backend
npm run dev
```

**Terminal 2 (Frontend):**
```bash
cd app
npm run dev
```

### Common Issues

#### 1. "Cannot find module '@langchain/openai'"

**Solution:**
```bash
cd backend
npm install @langchain/openai @langchain/community
```

#### 2. "TypeError: fetch is not defined"

**Solution:** Make sure Node.js version is 18+ or add fetch polyfill

#### 3. Backend times out when responding

**Could be:**
- First request initializes embeddings (slower)
- OpenAI API is slow
- Network issue

**Solution:** Wait a few seconds, try again

#### 4. CORS errors in browser console

**Solution:** Backend is running on different port
- Check `REACT_APP_API_URL` matches backend port
- Frontend: `http://localhost:5173`
- Backend: `http://localhost:5000`

#### 5. Knowledge base documents not loading

**Check:**
1. Do `.md` files exist in `knowledge-base/` folder?
2. Files have proper Markdown syntax?
3. Run `npm run dev` to restart backend

### Debugging

**Enable verbose logging:**

In `backend/src/index.ts`, add:

```typescript
console.log('Question:', question);
console.log('Retrieved docs:', docs.length);
console.log('Response:', answer.substring(0, 100));
```

**Check what documents were loaded:**

Visit `http://localhost:5000/api/chat/health` to see documentCount

---

## Production Deployment

### Before Deploying

- [ ] Test all conversation scenarios locally
- [ ] Verify safety guardrails work (try medical questions)
- [ ] Check response time is acceptable
- [ ] Ensure all documents provide value
- [ ] Set environment variables on production server
- [ ] Use process manager (PM2, systemd) for auto-restart

### Deployment Steps

1. **Environment Setup**
   ```bash
   export OPENAI_API_KEY=your-production-key
   export PORT=5000
   ```

2. **Build Backend**
   ```bash
   cd backend
   npm install
   npm run build
   npm start
   ```

3. **Build Frontend**
   ```bash
   cd app
   npm install
   npm run build
   ```

4. **Serve Frontend** (using server like nginx)
   ```
   server {
       listen 80;
       root /path/to/app/dist;
       index index.html;
   }
   ```

### Scaling Considerations

**For high usage:**
- Replace vector store with Chroma or Pinecone
- Use Redis for caching responses
- Add rate limiting to prevent abuse
- Use cheaper/faster LLM model (gpt-3.5-turbo)
- Deploy multiple backend instances behind load balancer

---

## Next Steps

### 1. Customize Knowledge Base

Create documents specific to your institution:
- College athletic policies
- Specific sports programs
- Local training facilities
- Athlete nutrition plans

### 2. Add More Features

- Document upload UI (admin only)
- Chat history persistence
- User-specific recommendations
- Multi-language support
- Integration with athlete management system

### 3. Monitor and Improve

- Log user questions to identify gaps
- Collect feedback on response quality
- Track system performance
- Update documents based on feedback

---

## Support

**Issues or questions?**
- Check troubleshooting section above
- Review backend logs for error messages
- Verify OpenAI API key is valid
- Check knowledge base documents exist

**Contact:**
- Backend issues: Check `backend/src/` for detailed error logging
- Frontend issues: Check browser console for errors
- API issues: Check OpenAI API status at status.openai.com
