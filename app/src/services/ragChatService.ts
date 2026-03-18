import type {
  ChatRequest,
  ChatResponse,
  DocumentUploadResponse,
  ChatMessage,
  RAGHealthStatus,
  RAGInfo
} from '@/types/rag'

// API base URL - can be configured via environment
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api'

const getErrorMessage = async (response: Response, fallback: string) => {
  const contentType = response.headers.get('content-type') || ''

  if (contentType.includes('application/json')) {
    const error = await response.json()
    return error.detail || error.message || fallback
  }

  const text = await response.text()
  return text || fallback
}

export const ragChatService = {
  /**
   * Send a message to the RAG chatbot
   */
  async sendMessage(request: ChatRequest): Promise<ChatResponse> {
    try {
      const prompt = request.question?.trim() || request.message?.trim() || ''
      const payload = {
        ...request,
        question: prompt,
      }

      const response = await fetch(`${API_BASE_URL}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const errorMessage = await getErrorMessage(response, 'Failed to get response from chatbot')
        
        // Provide more helpful error messages
        if (response.status === 500) {
          throw new Error(
            'Backend server error (500). Make sure the backend is running on port 8000. ' +
            `Run: cd backend && python main.py`
          )
        }
        if (response.status === 503) {
          throw new Error(
            'Backend service unavailable (503). Check that GROQ_API_KEY is set in backend/.env'
          )
        }
        if (response.status === 422) {
          throw new Error(
            'Invalid request format (422). Make sure your question is not empty.'
          )
        }
        
        throw new Error(errorMessage)
      }

      return await response.json()
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      console.error('Error sending message:', errorMessage)
      
      // Check if it's a network error (backend not running)
      if (error instanceof TypeError && errorMessage.includes('Failed to fetch')) {
        throw new Error(
          'Cannot connect to backend server on port 8000. ' +
          'Start the backend: cd backend && python main.py'
        )
      }
      
      throw error
    }
  },

  /**
   * Upload a document to the knowledge base
   */
  async uploadDocument(file: File): Promise<DocumentUploadResponse> {
    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch(`${API_BASE_URL}/documents/upload`, {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error(await getErrorMessage(response, 'Failed to upload document'))
      }

      return await response.json()
    } catch (error) {
      console.error('Error uploading document:', error)
      throw error
    }
  },

  /**
   * Get list of indexed documents
   */
  async listDocuments() {
    try {
      const response = await fetch(`${API_BASE_URL}/documents/list`)

      if (!response.ok) {
        throw new Error('Failed to fetch document list')
      }

      return await response.json()
    } catch (error) {
      console.error('Error fetching document list:', error)
      throw error
    }
  },

  /**
   * Check health status of RAG system and Ollama
   */
  async checkHealth(): Promise<RAGHealthStatus> {
    try {
      const response = await fetch(`${API_BASE_URL}/health`)

      if (!response.ok) {
        throw new Error('RAG system is not responding')
      }

      return await response.json()
    } catch (error) {
      console.error('Error checking health:', error)
      return {
        status: 'error',
        message: 'RAG system is not accessible',
        ollama_connected: false,
        timestamp: Date.now(),
      }
    }
  },

  /**
   * Get detailed info about RAG system
   */
  async getInfo(): Promise<RAGInfo | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/rag/info`)

      if (!response.ok) {
        throw new Error('Failed to fetch RAG info')
      }

      return await response.json()
    } catch (error) {
      console.error('Error fetching RAG info:', error)
      return null
    }
  },
}

/**
 * Utility to save/load chat history from localStorage
 */
export const chatHistoryService = {
  STORAGE_KEY: 'athnexus_chat_history',

  save(messages: ChatMessage[]): void {
    try {
      localStorage.setItem(
        this.STORAGE_KEY,
        JSON.stringify(
          messages.map(msg => ({
            ...msg,
            timestamp: typeof msg.timestamp === 'string'
              ? msg.timestamp
              : msg.timestamp.toISOString(),
          }))
        )
      )
    } catch (error) {
      console.error('Error saving chat history:', error)
    }
  },

  load(): ChatMessage[] {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY)
      if (!data) return []

      return JSON.parse(data).map((msg: any) => ({
        ...msg,
        timestamp: new Date(msg.timestamp),
      }))
    } catch (error) {
      console.error('Error loading chat history:', error)
      return []
    }
  },

  clear(): void {
    try {
      localStorage.removeItem(this.STORAGE_KEY)
    } catch (error) {
      console.error('Error clearing chat history:', error)
    }
  },
}
