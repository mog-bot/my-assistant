'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { useThemeStyles } from './theme-provider'

const DEMO_CONTEXT = `My Assistant is an AI-powered platform that gives businesses their own custom AI chatbot.

Key facts:
- Businesses paste their website URL, we scrape it and train a custom AI agent on their data
- The agent answers customer questions 24/7 on their website
- Setup takes minutes, not months — just scan your site and embed one line of code
- Captures leads by detecting buying intent
- Free tier: 1 agent, 50 messages/month
- Pro tier: $29/mo — 3 agents, unlimited messages, lead capture, custom branding
- Business tier: $79/mo — unlimited agents, white-label, API access, human handoff
- No coding required
- Works on any website
- Currently in early access — sign up with your email to get started`

const SUGGESTED_QUESTIONS = [
  'How does it work?',
  'What does it cost?',
  'Can I try it free?',
]

export function DemoChatBot() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([
    { role: 'bot', content: "Hey! 👋 I'm a demo of My Assistant. Ask me anything about the product — this is exactly what your customers would see on your site." },
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
        body: JSON.stringify({ message: trimmed, context: DEMO_CONTEXT }),
      })

      const data = await res.json()
      setMessages((prev) => [
        ...prev,
        { role: 'bot', content: data.reply || 'Sorry, something went wrong.' },
      ])
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'bot', content: "Couldn't connect right now. Try again in ec." },
      ])
    } finally {
      setIsLoading(false)
    }
  }, [input, isLoading])

  const handleSubmit = useCallback((e) => {
    e.preventDefault()
    sendMessage()
  }, [sendMessage])

  const handleSuggestion = useCallback((q) => {
    sendMessage(q)
  }, [sendMessage])

  return (
    <>
      {/* Floating Action Button */}
      <button
        onClick={() => setIsOpen((o) => !o)}
        aria-label={isOpen ? 'Close chat' : 'Open demo chat'}
        className={`fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full ${t.accentBg} text-white shadow-lg ${t.glowStrong} flex items-center justify-center text-2xl transition-all duration-200 hover:scale-110`}
      >
        {isOpen ? '✕' : '💬'}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div
          role="dialog"
          aria-label="Demo chat with My Assistant"
          className={`fixed bottom-24 right-6 z-50 w-[360px] max-w-[calc(100vw-48px)] h-[480px] max-h-[calc(100vh-120px)] rounded-2xl border ${t.cardBorder} shadow-2xl ${t.glowStrong} flex flex-col overflow-hidden`}
          style={{ background: 'var(--chat-bg, #0f0d1a)' }}
        >
          {/* Header */}
          <div className={`${t.accentBg} px-5 py-4 flex items-center justify-between shrink-0`}>
            <div>
              <p className="text-white font-semibold text-sm">My Assistant Demo</p>
              <p className="text-white/70 text-xs">See it in action</p>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-white/70 text-xs">Online</span>
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
                  className={`max-w-[85%] px-3.5 py-2.5 text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? `${t.accentBg} text-white rounded-2xl rounded-br-md`
                      : 'bg-white/10 text-gray-200 rounded-2xl rounded-bl-md'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white/10 text-gray-400 px-3.5 py-2.5 rounded-2xl rounded-bl-md text-sm italic">
                  Typing...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Suggested Questions (show only when few messages) */}
          {messages.length <= 2 && !isLoading && (
            <div className="px-4 pb-2 flex flex-wrap gap-2 shrink-0" style={{ background: '#0f0d1a' }}>
              {SUGGESTED_QUESTIONS.map((q) => (
                <button
                  key={q}
                  onClick={() => handleSuggestion(q)}
                  className={`text-xs px-3 py-1.5 rounded-full border ${t.accentBorder} ${t.accent} hover:${t.accentBg} hover:text-white transition-colors`}
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
            <label htmlFor="demo-chat-input" className="sr-only">Type a message</label>
            <input
              id="demo-chat-input"
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me anything..."
              disabled={isLoading}
              className="flex-1 px-3.5 py-2.5 rounded-lg bg-white/10 border border-white/15 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-purple-400 disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className={`px-4 py-2.5 ${t.accentBg} text-white rounded-lg text-sm font-semibold transition-opacity disabled:opacity-40`}
            >
              Send
            </button>
          </form>

          {/* Badge */}
          <div className="text-center py-2 text-[11px] text-gray-600 shrink-0" style={{ background: '#0f0d1a' }}>
            Powered by <span className={t.accent}>My Assistant</span>
          </div>
        </div>
      )}
    </>
  )
}
