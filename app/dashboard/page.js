'use client'

import { useState, useCallback } from 'react'
import { useThemeStyles } from '@/components/theme-provider'
import { ThemeToggle } from '@/components/theme-toggle'

export default function Dashboard() {
  const [websiteUrl, setWebsiteUrl] = useState('')
  const [status, setStatus] = useState('idle')
  const [businessData, setBusinessData] = useState(null)
  const [error, setError] = useState('')
  const [testMessage, setTestMessage] = useState('')
  const [chatMessages, setChatMessages] = useState([])
  const [chatLoading, setChatLoading] = useState(false)
  const t = useThemeStyles()

  const handleScrape = useCallback(async (e) => {
    e.preventDefault()
    setStatus('scraping')
    setError('')

    try {
      let url = websiteUrl.trim()
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'https://' + url
      }

      const res = await fetch('/api/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Failed to scrape website')
      }

      const data = await res.json()
      setBusinessData(data)
      setStatus('ready')
    } catch (err) {
      setError(err.message)
      setStatus('error')
    }
  }, [websiteUrl])

  const handleChat = useCallback(async (e) => {
    e.preventDefault()
    if (!testMessage.trim() || !businessData) return

    const userMsg = testMessage.trim()
    setChatMessages((prev) => [...prev, { role: 'user', content: userMsg }])
    setTestMessage('')
    setChatLoading(true)

    try {
      const context = `${businessData.title}\n${businessData.description}\n${businessData.content}`
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg, context }),
      })

      const data = await res.json()
      setChatMessages((prev) => [
        ...prev,
        { role: 'assistant', content: data.reply || data.error || 'No response' },
      ])
    } catch {
      setChatMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Sorry, something went wrong. Please try again.' },
      ])
    } finally {
      setChatLoading(false)
    }
  }, [testMessage, businessData])

  const embedCode = `<script src="${typeof window !== 'undefined' ? window.location.origin : ''}/widget.js" data-agent-id="demo"></script>`

  return (
    <main className={`min-h-screen ${t.bg} ${t.text} ${t.font}`}>
      <nav className={`border-b ${t.navBorder} px-8 py-4`}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <a href="/" className={`text-xl font-bold ${t.text}`}>
            <span className={t.accent}>&gt;_</span> My Assistant
          </a>
          <div className="flex items-center gap-4">
            <span className={`text-sm ${t.textMuted}`}>Dashboard</span>
            <ThemeToggle />
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-8 py-12">
        <h1 className={`text-3xl font-bold mb-8 ${t.text}`}>Set Up Your AI Agent</h1>

        {/* Step 1: Connect Website */}
        <section className="mb-12">
          <h2 className={`text-xl font-semibold mb-4 flex items-center gap-3 ${t.text}`}>
            <span className={`w-8 h-8 ${t.accentBg} rounded-full flex items-center justify-center text-sm font-bold text-white`}>1</span>
            Connect Your Website
          </h2>
          <form onSubmit={handleScrape} className="flex gap-4">
            <input
              type="text"
              value={websiteUrl}
              onChange={(e) => setWebsiteUrl(e.target.value)}
              placeholder="yourwebsite.com"
              className={`flex-1 px-4 py-3 rounded-lg ${t.inputBg} border ${t.inputBorder} ${t.text} placeholder-gray-400 focus:outline-none ${t.inputFocus}`}
              disabled={status === 'scraping'}
              required
            />
            <button
              type="submit"
              disabled={status === 'scraping'}
              className={`px-6 py-3 ${t.accentBg} ${t.accentHover} text-white rounded-lg font-semibold transition-colors disabled:opacity-50`}
            >
              {status === 'scraping' ? 'Scanning...' : 'Scan Website'}
            </button>
          </form>
          {error && (
            <p className="mt-3 text-red-400 text-sm">{error}</p>
          )}
        </section>

        {/* Step 2: Review Data */}
        {businessData && (
          <section className="mb-12">
            <h2 className={`text-xl font-semibold mb-4 flex items-center gap-3 ${t.text}`}>
              <span className={`w-8 h-8 ${t.accentBg} rounded-full flex items-center justify-center text-sm font-bold text-white`}>2</span>
              Your Business Data
            </h2>
            <div className={`${t.cardBg} border ${t.cardBorder} rounded-xl p-6`}>
              <h3 className={`font-semibold text-lg mb-1 ${t.text}`}>{businessData.title || 'Untitled'}</h3>
              <p className={`${t.textMuted} text-sm mb-4`}>{businessData.description || 'No description found'}</p>
              <div className={`${t.codeBg} rounded-lg p-4 max-h-48 overflow-y-auto`}>
                <p className={`${t.textMuted} text-sm whitespace-pre-wrap`}>
                  {businessData.content?.slice(0, 1000) || 'No content extracted'}
                  {businessData.content?.length > 1000 && '...'}
                </p>
              </div>
              <p className={`${t.textSubtle} text-xs mt-2`}>
                {businessData.content?.length || 0} characters extracted •{' '}
                {businessData.internalLinks?.length || 0} internal pages found
              </p>
            </div>
          </section>
        )}

        {/* Step 3: Test Your Agent */}
        {status === 'ready' && (
          <section className="mb-12">
            <h2 className={`text-xl font-semibold mb-4 flex items-center gap-3 ${t.text}`}>
              <span className={`w-8 h-8 ${t.accentBg} rounded-full flex items-center justify-center text-sm font-bold text-white`}>3</span>
              Test Your Agent
            </h2>
            <div className={`${t.cardBg} border ${t.cardBorder} rounded-xl overflow-hidden`}>
              <div className="p-6 min-h-[200px] max-h-[400px] overflow-y-auto space-y-4">
                {chatMessages.length === 0 && (
                  <p className={`${t.textSubtle} text-center py-8`}>
                    Ask your agent a question about your business
                  </p>
                )}
                {chatMessages.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] px-4 py-3 rounded-xl ${
                        msg.role === 'user'
                          ? `${t.accentBg} text-white`
                          : `${t.cardBg} border ${t.cardBorder} ${t.text}`
                      }`}
                    >
                      {msg.content}
                    </div>
                  </div>
                ))}
                {chatLoading && (
                  <div className="flex justify-start">
                    <div className={`${t.cardBg} border ${t.cardBorder} px-4 py-3 rounded-xl ${t.textMuted}`}>
                      Thinking...
                    </div>
                  </div>
                )}
              </div>
              <form onSubmit={handleChat} className={`border-t ${t.navBorder} p-4 flex gap-3`}>
                <input
                  type="text"
                  value={testMessage}
                  onChange={(e) => setTestMessage(e.target.value)}
                  placeholder="Ask a question about your business..."
                  className={`flex-1 px-4 py-3 rounded-lg ${t.inputBg} border ${t.inputBorder} ${t.text} placeholder-gray-400 focus:outline-none ${t.inputFocus}`}
                  disabled={chatLoading}
                />
                <button
                  type="submit"
                  disabled={chatLoading || !testMessage.trim()}
                  className={`px-6 py-3 ${t.accentBg} ${t.accentHover} text-white rounded-lg font-semibold transition-colors disabled:opacity-50`}
                >
                  Send
                </button>
              </form>
            </div>
          </section>
        )}

        {/* Step 4: Embed */}
        {status === 'ready' && (
          <section className="mb-12">
            <h2 className={`text-xl font-semibold mb-4 flex items-center gap-3 ${t.text}`}>
              <span className={`w-8 h-8 ${t.accentBg} rounded-full flex items-center justify-center text-sm font-bold text-white`}>4</span>
              Add to Your Website
            </h2>
            <p className={`${t.textMuted} mb-4`}>
              Copy this code and paste it before the closing <code className={t.accent}>&lt;/body&gt;</code> tag on your website.
            </p>
            <div className={`${t.codeBg} border ${t.cardBorder} rounded-xl p-4 ${t.font} text-sm ${t.codeText} relative`}>
              <code>{embedCode}</code>
              <button
                onClick={() => navigator.clipboard?.writeText(embedCode)}
                className={`absolute top-3 right-3 px-3 py-1 ${t.inputBg} ${t.cardHover} rounded text-xs ${t.textMuted} transition-colors`}
              >
                Copy
              </button>
            </div>
          </section>
        )}
      </div>
    </main>
  )
}
