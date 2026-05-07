'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { useThemeStyles } from './theme-provider'

const SITE_KNOWLEDGE = `You are the AI assistant on the My Assistant website. You help visitors with TWO things:

1. PRODUCT QUESTIONS — What My Assistant is, pricing, features, how it works
2. SETUP GUIDE — How to add the My Assistant chatbot to their own website

=== PRODUCT INFO ===
My Assistant is an AI-powered platform that gives businesses their own custom AI chatbot.

How it works:
- Sign up with your email (free to start)
- Go to the Dashboard (/dashboard)
- Paste your website URL — we automatically scrape and learn your business data
- Test your AI agent right in the dashboard to make sure it answers correctly
- Copy the one-line embed code and paste it into your website
- Your AI agent is now live, answering customer questions 24/7

Key features:
- Custom AI trained on YOUR business data
- Lightning-fast responses (milliseconds)
- One-line embed — no coding required
- Lead capture (detects buying intent)
- Works on any website (HTML, WordPress, Shopify, Wix, Squarespace, etc.)
- 24/7 availability
- Your data stays private

Pricing:
- Starter (Free): 1 AI agent, 50 messages/month, website scraping, basic widget, "Powered by My Assistant" badge
- Pro ($29/mo): 3 agents, unlimited messages, lead capture, custom branding, weekly insights, priority support
- Business ($79/mo): Unlimited agents, unlimited messages, white-label widget, API access, human handoff, dedicated support

Currently in early access — sign up to get started.

=== SETUP / INTEGRATION GUIDE ===
When someone asks how to add the chatbot to their site, walk them through these steps:

Step 1: Sign up on our homepage (scroll down to the email form, or click "Get Started")
Step 2: Go to the Dashboard (link: /dashboard)
Step 3: Enter your website URL and click "Scan Website" — we'll automatically extract your business info
Step 4: Test your agent — ask it questions to make sure it knows your business
Step 5: Copy the embed code shown in Step 4 of the dashboard
Step 6: Paste this code into your website, just before the closing </body> tag

The embed code looks like this:
<script src="https://my-assistant-bhre.vercel.app/widget.js" data-agent-id="demo"></script>

Optional customization attributes:
- data-color="#7c3aed" (change the accent color — any hex color)
- data-position="right" (or "left" — where the chat button appears)
- data-greeting="Hi! How can I help?" (custom first message)

Example with customization:
<script src="https://my-assistant-bhre.vercel.app/widget.js" data-agent-id="demo" data-color="#2563eb" data-position="right" data-greeting="Welcome! Ask me anything."></script>

Platform-specific instructions:
- WordPress: Go to Appearance > Theme Editor > footer.php, paste before </body>. Or use "Insert Headers and Footers" plugin.
- Shopify: Go to Online Store > Themes > Edit Code > theme.liquid, paste before </body>
- Wix: Go to Settings > Custom Code > Add Code > paste in Body (end)
- Squarespace: Go to Settings > Advanced > Code Injection > Footer, paste there
- HTML: Just paste before </body> in your HTML file

=== BEHAVIOR ===
- Be professional, helpful, and concise
- Do NOT use emojis
- If they ask something you don't know, say "I don't have that information, but feel free to reach out to our team for help."
- Always encourage them to try the dashboard
- You ARE the product demo — demonstrate value through clear, knowledgeable responses`

const SUGGESTED_QUESTIONS = [
  'How does it work?',
  'How do I add this to my site?',
  'What does it cost?',
  'Show me the embed code',
]

export function DemoChatBot() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([
    { role: 'bot', content: "Welcome — I'm a live demo of My Assistant. This is exactly what your customers would experience on your site. Ask me anything about the product, or I can walk you through the setup process." },
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
        body: JSON.stringify({ message: trimmed, context: SITE_KNOWLEDGE }),
      })

      const data = await res.json()
      setMessages((prev) => [
        ...prev,
        { role: 'bot', content: data.reply || 'Sorry, something went wrong.' },
      ])
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'bot', content: "Couldn't connect right now. Try again in a sec." },
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
        {isOpen ? '✕' : (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div
          role="dialog"
          aria-label="Chat with My Assistant"
          className={`fixed bottom-24 right-6 z-50 w-[380px] max-w-[calc(100vw-48px)] h-[520px] max-h-[calc(100vh-120px)] rounded-2xl border ${t.cardBorder} shadow-2xl ${t.glowStrong} flex flex-col overflow-hidden`}
          style={{ background: 'var(--chat-bg, #0f0d1a)' }}
        >
          {/* Header */}
          <div className={`${t.accentBg} px-5 py-4 flex items-center justify-between shrink-0`}>
            <div>
              <p className="text-white font-semibold text-sm">My Assistant</p>
              <p className="text-white/70 text-xs">Ask about the product or how to set up</p>
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
                  className={`max-w-[85%] px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${
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

          {/* Suggested Questions (show only at start) */}
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
