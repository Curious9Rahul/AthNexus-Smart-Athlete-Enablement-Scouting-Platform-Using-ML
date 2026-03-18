import React, { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Loader2, Send, Trash2, Upload, AlertCircle, CheckCircle2 } from 'lucide-react'
import { ragChatService, chatHistoryService } from '@/services/ragChatService'
import type { ChatMessage, ChatResponse } from '@/types/rag'
import './AIAssistant.css'

export default function AIAssistant() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [ragHealth, setRagHealth] = useState<{ connected: boolean; message: string }>({
    connected: false,
    message: 'Checking connection...',
  })
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Load chat history and check RAG system on mount
  useEffect(() => {
    const loadData = async () => {
      // Load chat history from localStorage
      const history = chatHistoryService.load()
      setMessages(history)

      // Check RAG system health
      const health = await ragChatService.checkHealth()
      const isConnected = health.provider_connected ?? health.ollama_connected
      setRagHealth({
        connected: isConnected,
        message: health.message,
      })
    }

    loadData()
  }, [])

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Save messages to localStorage whenever they change
  useEffect(() => {
    if (messages.length > 0) {
      chatHistoryService.save(messages)
    }
  }, [messages])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!input.trim()) return

    if (!ragHealth.connected) {
      setError(
        ragHealth.message || 'AthNexus AI backend is not available right now.'
      )
      return
    }

    const userMessage = input.trim()
    setInput('')
    setError(null)
    setLoading(true)

    // Add user message to chat
    const userMessageObj: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: userMessage,
      timestamp: new Date(),
    }

    setMessages([...messages, userMessageObj])

    try {
      // Get response from RAG chatbot
      const response: ChatResponse = await ragChatService.sendMessage({
        question: userMessage,
      })

      // Add assistant message to chat
      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: response.answer,
        sources: response.sources,
        timestamp: new Date(),
      }

      setMessages(prev => [...prev, assistantMessage])
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get response'
      setError(errorMessage)

      // Provide detailed error guidance based on the error type
      let detailedError = errorMessage
      if (errorMessage.includes('Backend server error (500)')) {
        detailedError = `${errorMessage}\n\nSteps to fix:\n1. Open a terminal in the backend folder\n2. Run: python main.py\n3. After server starts, try again`
      } else if (errorMessage.includes('Cannot connect to backend')) {
        detailedError = `${errorMessage}\n\nYou need to start the backend server in a separate terminal:\ncd backend && python main.py`
      } else if (errorMessage.includes('GROQ_API_KEY')) {
        detailedError = `${errorMessage}\n\nSet your API key:\n1. Create/edit backend/.env\n2. Add: GROQ_API_KEY=your_key_here\n3. Restart the backend`
      }

      // Add error message to chat with detailed guidance
      const errorMsg: ChatMessage = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: `Sorry, I encountered an error:\n\n${detailedError}`,
        timestamp: new Date(),
      }
      setMessages(prev => [...prev, errorMsg])
    } finally {
      setLoading(false)
    }
  }

  const handleClearHistory = () => {
    if (confirm('Are you sure you want to clear chat history?')) {
      setMessages([])
      chatHistoryService.clear()
    }
  }

  const handleDocumentUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setLoading(true)
    setError(null)

    try {
      const response = await ragChatService.uploadDocument(file)
      setError(null)
      alert(
        `Document uploaded successfully! Created ${response.chunks_created} chunks from "${response.filename}"`
      )
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to upload document'
      setError(errorMessage)
    } finally {
      setLoading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  return (
    <div className="ai-assistant-container">
      <div className="ai-header">
        <div className="ai-title">
          <h1>AI Assistant for Athletes</h1>
          <p>Ask questions about training, recovery, nutrition, and more</p>
        </div>

        {ragHealth.connected ? (
          <div className="rag-status connected">
            <CheckCircle2 size={16} />
            <span>Connected</span>
          </div>
        ) : (
          <div className="rag-status disconnected">
            <AlertCircle size={16} />
            <span>Offline</span>
          </div>
        )}
      </div>

      {error && (
        <div className="error-banner">
          <AlertCircle size={20} />
          <div>
            <strong>Error:</strong> {error}
          </div>
          <button onClick={() => setError(null)}>Dismiss</button>
        </div>
      )}

      {!ragHealth.connected && (
        <div className="warning-banner">
          <AlertCircle size={20} />
          <div>
            <strong>AI backend is offline.</strong> Start the backend service on port <code>8000</code>.
          </div>
        </div>
      )}

      <div className="messages-container">
        {messages.length === 0 ? (
          <div className="empty-state">
            <h2>Welcome to the AI Assistant!</h2>
            <p>Ask me anything about:</p>
            <ul>
              <li>Training and strength programs</li>
              <li>Recovery and sleep optimization</li>
              <li>Nutrition and hydration</li>
              <li>Injury prevention</li>
              <li>Balancing sports and academics</li>
            </ul>
          </div>
        ) : (
          messages.map(message => (
            <div key={message.id} className={`message message-${message.role}`}>
              <div className="message-content">
                <p>{message.content}</p>

                {message.sources && message.sources.length > 0 && (
                  <div className="message-sources">
                    <div className="sources-label">📚 Sources:</div>
                    {message.sources.map((source, idx) => (
                      <div key={idx} className="source-item">
                        <strong>{source.filename}</strong>
                        <p className="source-excerpt">{source.content}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))
        )}

        {loading && (
          <div className="message message-assistant loading">
            <div className="typing-indicator">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="ai-controls">
        <div className="control-buttons">
          <Button
            variant="outline"
            size="sm"
            onClick={handleClearHistory}
            disabled={messages.length === 0 || loading}
            title="Clear all chat history"
          >
            <Trash2 size={16} />
            Clear
          </Button>

          <label>
            <Button
              variant="outline"
              size="sm"
              disabled={loading || !ragHealth.connected}
              title="Upload a markdown or text file to add to knowledge base"
              className="upload-button"
            >
              <Upload size={16} />
              Upload Doc
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".md,.txt,.markdown"
              onChange={handleDocumentUpload}
              disabled={loading}
              style={{ display: 'none' }}
            />
          </label>
        </div>
      </div>

      <form onSubmit={handleSendMessage} className="input-form">
        <Input
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Ask me anything about training, recovery, nutrition..."
          disabled={loading || !ragHealth.connected}
          className="input-field"
        />
        <Button
          type="submit"
          disabled={loading || !input.trim() || !ragHealth.connected}
          className="send-button"
        >
          {loading ? <Loader2 size={20} className="spin" /> : <Send size={20} />}
        </Button>
      </form>

      {!ragHealth.connected && (
        <div className="footer-notice">
          To use the AI Assistant, start the AthNexus backend on port
          <code>8000</code>
        </div>
      )}
    </div>
  )
}
