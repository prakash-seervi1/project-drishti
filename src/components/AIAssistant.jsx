"use client"

import { useState, useRef, useEffect } from "react"
import { X, Send, Bot, User, Loader2, RefreshCw } from "lucide-react"
import { agentAPI } from "../services/adkApi";
import ReactMarkdown from "react-markdown"

export default function AIAssistant({ isOpen, onClose }) {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: "assistant",
      content:
        "👋 Hi! I'm your enhanced AI safety assistant. I can help you with:\n\n• 📊 Real-time analytics and reports\n• 🚨 Incident monitoring and alerts\n• 🏢 Zone status and occupancy\n• 👨‍🚒 Responder management\n• 🛡️ Safety recommendations\n\nWhat would you like to know about?",
      timestamp: new Date(),
    },
  ])
  const [inputValue, setInputValue] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isConnected, setIsConnected] = useState(true)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && isOpen) {
        onClose()
      }
    }
    document.addEventListener("keydown", handleEscape)
    return () => document.removeEventListener("keydown", handleEscape)
  }, [isOpen, onClose])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!inputValue.trim() || isLoading) return

    const userMessage = {
      id: Date.now(),
      type: "user",
      content: inputValue.trim(),
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputValue("")
    setIsLoading(true)
    setIsConnected(true)

    try {
      const response = await agentAPI.runAgent({input:userMessage.content})
      if (response.answer) {
        const assistantMessage = {
          id: Date.now() + 1,
          type: "assistant",
          content: response.answer || "I couldn't process your request. Please try again.",
          timestamp: new Date(),
          context: response.context
        }
        setMessages((prev) => [...prev, assistantMessage])
      } else {
        throw new Error(response.error || 'Failed to get response')
      }
    } catch (error) {
      console.error('Chat Agent Error:', error)
      setIsConnected(false)
      const errorMessage = {
        id: Date.now() + 1,
        type: "assistant",
        content: error.message.includes('Failed to fetch') 
          ? "❌ Connection lost. Please check your internet connection and try again."
          : "❌ I'm having trouble processing your request right now. Please try again in a moment.",
        timestamp: new Date(),
        isError: true
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleQuickAction = (action) => {
    setInputValue(action.text)
  }

  const retryConnection = () => {
    setIsConnected(true)
    setMessages(prev => prev.filter(msg => !msg.isError))
  }

  const quickActions = [
    { text: "Show me active incidents", icon: "🚨", category: "incidents" },
    { text: "What's the status of Zone A?", icon: "🏢", category: "zones" },
    { text: "How many responders are available?", icon: "👨‍🚒", category: "responders" },
    { text: "Give me a system overview", icon: "📊", category: "analytics" },
    { text: "What are the safety recommendations?", icon: "🛡️", category: "safety" },
    { text: "Show me critical alerts", icon: "⚠️", category: "alerts" },
  ]

  if (!isOpen) return null

  return (
    <>
      {/* Overlay for modal close on click outside (desktop only) */}
      <div className="fixed inset-0 z-40" onClick={onClose} style={{ background: 'transparent' }} />
      {/* Floating Card Modal */}
      <div
        className="fixed bottom-8 right-8 z-50 w-full max-w-md bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col"
        style={{ minWidth: 340, maxHeight: '80vh', height: 'auto' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-white rounded-t-2xl">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center text-white">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-semibold text-gray-900">AI Safety Assistant</h2>
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`}></div>
                <p className="text-xs text-gray-500">
                  {isConnected ? 'Connected' : 'Disconnected'}
                </p>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Connection Error Banner */}
        {!isConnected && (
          <div className="bg-red-50 border-b border-red-200 p-3 rounded-b-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                <span className="text-sm text-red-700">Connection lost</span>
              </div>
              <button
                onClick={retryConnection}
                className="flex items-center space-x-1 text-xs text-red-600 hover:text-red-800"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Retry</span>
              </button>
            </div>
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-white">
          {messages.map((message) => (
            <div key={message.id} className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`flex items-start space-x-2 max-w-[85%] ${message.type === "user" ? "flex-row-reverse space-x-reverse" : ""}`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    message.type === "user"
                      ? "bg-blue-600 text-white"
                      : message.isError
                        ? "bg-red-500 text-white"
                      : "bg-gradient-to-br from-green-500 to-emerald-600 text-white"
                  }`}
                >
                  {message.type === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>
                <div
                  className={`rounded-2xl px-4 py-3 ${
                    message.type === "user" 
                      ? "bg-blue-600 text-white" 
                      : message.isError
                      ? "bg-red-50 text-red-900 border border-red-200"
                      : "bg-gray-50 text-gray-900 border border-gray-100"
                  }`}
                >
                  {message.type === "assistant" && !message.isError ? (
                    <div className="prose prose-blue max-w-none">
                      <ReactMarkdown>{message.content}</ReactMarkdown>
                    </div>
                  ) : (
                    <div className="whitespace-pre-wrap text-sm">{message.content}</div>
                  )}
                  {message.context && (
                    <div className="mt-2 pt-2 border-t border-gray-200">
                      <p className="text-xs text-gray-500">
                        <strong>Context:</strong> {message.context}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="flex items-start space-x-2 max-w-[85%]">
                <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div className="bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3">
                  <div className="flex items-center space-x-2">
                    <Loader2 className="w-4 h-4 animate-spin text-gray-500" />
                    <span className="text-sm text-gray-600">AI is thinking...</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Actions */}
        {messages.length === 1 && (
          <div className="p-4 border-t border-gray-100 bg-white rounded-b-2xl">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Quick Actions:</h3>
            <div className="grid grid-cols-2 gap-2">
              {quickActions.map((action, index) => (
                <button
                  key={index}
                  onClick={() => handleQuickAction(action)}
                 className="flex items-center space-x-2 p-2 text-xs bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-100 transition-colors"
                >
                  <span>{action.icon}</span>
                  <span className="text-gray-700">{action.text}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div className="p-4 border-t border-gray-100 bg-white rounded-b-2xl">
          <form onSubmit={handleSubmit} className="flex space-x-2">
            <input
              ref={inputRef}
              type="text"
              className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900 shadow-sm"
              placeholder="Type your question..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              disabled={isLoading}
            />
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 font-semibold text-sm disabled:opacity-50"
              disabled={isLoading || !inputValue.trim()}
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </button>
          </form>
        </div>
      </div>
    </>
  )
}
