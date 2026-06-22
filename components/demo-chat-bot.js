'use client'

import { useState, useRef, useEffect, useCallback } from 'react'

/**
 * DemoChatBot — Homepage demo chat.
 * Uses the EXACT SAME base design as public/widget.js.
 * Customizable: colour, font, name. Base structure is fixed.
 */

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
- One simple plan: $20.50/week
- Includes: your own custom AI agent, trained on your business data, unlimited messages, unlimited conversations, one-click install, lead capture, custom branding, priority support
- No free tier, no multiple plans — just one straightforward price

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
- data-font="inter" (font: system, inter, poppins, rounded, serif, mono)

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

export function DemoChatBot() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([
    { role: 'bot', content: "Welcome — I'm a live demo of My Assistant. This is exactly what your customers would experience on your site. Ask me anything about the product, or I can walk you through the setup process." },
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  // Customizable
  const primaryColor = '#7c3aed'

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

  function nowTime() {
    const d = new Date()
    const h = d.getHours(), m = d.getMinutes()
    return (h < 10 ? '0' : '') + h + ':' + (m < 10 ? '0' : '') + m
  }

  return (
    <>
      {/* FAB — same as widget.js */}
      <button
        onClick={() => setIsOpen((o) => !o)}
        aria-label={isOpen ? 'Close chat' : 'Open demo chat'}
        className="fixed bottom-6 right-6 z-50 w-[60px] h-[60px] rounded-full text-white border-none cursor-pointer flex items-center justify-center transition-transform duration-200 hover:scale-[1.08]"
        style={{ background: primaryColor, boxShadow: `0 4px 16px rgba(124, 58, 237, 0.4)` }}
      >
        {isOpen ? (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 6L6 18M6 6l12 12"/>
          </svg>
        ) : (
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
        )}
      </button>

      {/* Chat Window — mirrors widget.js base design exactly */}
      {isOpen && (
        <div
          role="dialog"
          aria-label="Chat with My Assistant"
          className="fixed bottom-[100px] right-6 z-50 w-[380px] max-w-[calc(100vw-48px)] h-[560px] max-h-[calc(100vh-120px)] rounded-2xl flex flex-col overflow-hidden animate-[slideUp_0.3s_ease]"
          style={{ background: '#ffffff', boxShadow: '0 20px 60px rgba(0,0,0,0.15), 0 0 0 1px rgba(0,0,0,0.06)' }}
        >
          {/* Header */}
          <div
            className="px-5 py-[18px] flex items-center justify-between shrink-0"
            style={{ background: primaryColor }}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/25 flex items-center justify-center text-white font-bold text-base shrink-0">
                M
              </div>
              <div className="flex flex-col">
                <span className="text-white font-semibold text-[15px] leading-tight">My Assistant</span>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="w-2 h-2 rounded-full bg-green-300"></span>
                  <span className="text-white/85 text-xs">Online</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="w-[30px] h-[30px] rounded-full bg-white/20 border-none text-white cursor-pointer flex items-center justify-center text-lg hover:bg-white/35 transition-colors shrink-0"
              aria-label="Close chat"
            >
              &times;
            </button>
          </div>

          {/* Messages — same base: light bg, rounded bubbles */}
          <div className="flex-1 overflow-y-auto px-4 py-5 flex flex-col gap-4 bg-[#f9fafb]">
            {/* Date divider */}
            <div className="text-center my-1">
              <span className="text-xs text-gray-400 bg-[#f3f4f6] px-3.5 py-1 rounded-full">Today</span>
            </div>

            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[78%] px-4 py-3 text-[15px] leading-[1.5] ${
                    msg.role === 'user'
                      ? 'rounded-[20px] rounded-br-[6px] text-white'
                      : 'rounded-[20px] rounded-bl-[6px] text-gray-800 border border-gray-200'
                  }`}
                  style={msg.role === 'user'
                    ? { background: primaryColor }
                    : { background: '#f3f4f6' }
                  }
                >
                  {/* Text — break-word ensures it never overflows */}
                  <span className="block break-words whitespace-pre-wrap" style={{ overflowWrap: 'break-word', wordBreak: 'break-word', hyphens: 'auto', minWidth: 0 }}>
                    {msg.content}
                  </span>
                  <span className={`block text-[11px] mt-1 text-right ${
                    msg.role === 'user' ? 'text-white/65' : 'text-gray-400'
                  }`}>
                    {nowTime()}
                  </span>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="px-4 py-3 rounded-[20px] rounded-bl-[6px] bg-[#f3f4f6] border border-gray-200">
                  <div className="flex gap-1 items-center h-5">
                    <span className="w-[7px] h-[7px] rounded-full bg-black/30 animate-bounce" style={{ animationDelay: '0s' }}></span>
                    <span className="w-[7px] h-[7px] rounded-full bg-black/30 animate-bounce" style={{ animationDelay: '0.16s' }}></span>
                    <span className="w-[7px] h-[7px] rounded-full bg-black/30 animate-bounce" style={{ animationDelay: '0.32s' }}></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input area — same base: pill input + circle send */}
          <form
            onSubmit={handleSubmit}
            className="px-4 py-3.5 flex gap-2.5 items-center shrink-0 border-t border-gray-200 bg-white"
          >
            <label htmlFor="demo-chat-input" className="sr-only">Type a message</label>
            <input
              id="demo-chat-input"
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type a message..."
              disabled={isLoading}
              className="flex-1 px-[18px] py-3 rounded-full bg-[#f3f4f6] border border-gray-200 text-gray-800 text-[15px] outline-none transition-colors focus:border-purple-500 disabled:opacity-50 placeholder:text-gray-400"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="w-10 h-10 rounded-full text-white border-none cursor-pointer flex items-center justify-center transition-all hover:scale-[1.06] disabled:opacity-35 disabled:cursor-not-allowed disabled:transform-none shrink-0"
              style={{ background: primaryColor }}
              aria-label="Send"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
              </svg>
            </button>
          </form>
        </div>
      )}

      <style jsx global>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </>
  )
}
