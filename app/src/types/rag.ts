export interface SourceDocument {
  title: string
  content: string
  filename: string
  page?: number
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  sources?: SourceDocument[]
  timestamp: Date
}

export interface ChatRequest {
  question: string
  message?: string
  user_id?: string
  sport?: string
}

export interface ChatResponse {
  answer: string
  sources: SourceDocument[]
  confidence: number
  retrieval_time_ms: number
}

export interface DocumentUploadResponse {
  message: string
  filename: string
  chunks_created: number
}

export interface RAGHealthStatus {
  status: string
  message: string
  ollama_connected: boolean
  provider?: string
  provider_connected?: boolean
  document_count?: number
  timestamp: number
}

export interface RAGInfo {
  system: string
  provider?: string
  provider_connected?: boolean
  collection_info: {
    collection_name: string
    document_count: number
    status: string
  }
  ollama_connected: boolean
  model: string
  vector_db: string
  status: string
}
