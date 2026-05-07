'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { useThemeStyles } from './theme-provider'

export function DemoPreviewChat({ business }) {
  const [isOpen, setIsOpen] = useState(true)
  const [messages, setMessages] = useState([
    { role: 'bot', content: business.welcomeMessage },
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)
  const t = useThemeStyles()

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, scrollToBottom])

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  const sendMessage = useCallback(async (text) => {
    const trimmed = (text || input).trim()
    if (!trimmed || isLoading) return

    setInput('')
    setMessages((prev) => [...prev, { role: 'user', content: trimmed }])
    setIsLoading(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: trimmed, context: business.context }),
      })

      const data = await res.json()
      setMessages((prev) => [
        ...prev,
        { role: 'bot', content: data.reply || 'Sorry, something went wrong.' },
      ])
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'bot', content: "Couldn't connect right now. Please try again." },
      ])
    } finally {
      setIsLoading(false)
    }
  }, [input, isLoading, business.context])

  const handleSubmit = useCallback((e) => {
    e.preventDefault()
    sendMessage()
  }, [sendMessage])

  const handleSuggestion = useCallback((q) => {
    sendMessage(q)
  }, [sendMessage])

  return (
    <div className="flex flex-col w-full h-[560px] max-h-[80vh] rounded-2xl overflow-hidden shadow-2xl border border-white/10">
      {/* Header */}
      <div
        className="px-5 py-4 flex items-center justify-between shrink-0"
        style={{ background: business.color }}
      >
        <div>
          <p className="text-white font-semibold">{business.name} AI Assistant</p>
          <p className="text-white/80 text-xs">Live demo — trained on {business.website}</p>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
          <span className="text-white/80 text-xs">Online</span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3" style={{ background: '#0f0d1a' }}>
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap rounded-2xl ${
                msg.role === 'user'
                  ? 'text-white rounded-br-md'
                  : 'bg-white/10 text-gray-200 rounded-bl-md'
              }`}
              style={msg.role === 'user' ? { background: business.color } : {}}
            >
              {msg.content}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white/10 text-gray-400 px-4 py-2.5 rounded-2xl rounded-bl-md text-sm italic">
              Typing...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Questions */}
      {messages.length <= 2 && !isLoading && (
        <div className="px-4 pb-2 flex flex-wrap gap-2 shrink-0" style={{ background: '#0f0d1a' }}>
          {business.suggestedQuestions.map((q) => (
            <button
              key={q}
              onClick={() => handleSuggestion(q)}
              className="text-xs px-3 py-1.5 rounded-full border transition-colors hover:text-white"
              style={{ borderColor: business.color, color: business.color }}
              onMouseEnter={(e) => (e.currentTarget.style.background = business.color)}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
            >
              {q}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <form
        onSubmit={handleSubmit}
        className="px-4 py-3 flex gap-2 shrink-0 border-t border-white/10"
        style={{ background: '#0f0d1a' }}
      >
        <label htmlFor="demo-preview-input" className="sr-only">Type a message</label>
        <input
          id="demo-preview-input"
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask me anything..."
          disabled={isLoading}
          className="flex-1 px-3.5 py-2.5 rounded-lg bg-white/10 border border-white/15 text-white text-sm placeholder-gray-500 focus:outline-none disabled:opacity-50"
          style={{ borderColor: isLoading ? undefined : 'rgba(255,255,255,0.15)' }}
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="px-4 py-2.5 text-white rounded-lg text-sm font-semibold transition-opacity disabled:opacity-40"
          style={{ background: business.color }}
        >
          Send
        </button>
      </form>
    </div>
  )
}
