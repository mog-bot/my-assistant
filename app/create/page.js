'use client'

import { useState, useCallback } from 'react'

const COLOR_PRESETS = [
  { name: 'Purple', primary: '#7c3aed', bubble: '#7c3aed' },
  { name: 'Blue', primary: '#2563eb', bubble: '#2563eb' },
  { name: 'Green', primary: '#16a34a', bubble: '#16a34a' },
  { name: 'Red', primary: '#dc2626', bubble: '#dc2626' },
  { name: 'Orange', primary: '#ea580c', bubble: '#ea580c' },
  { name: 'Pink', primary: '#db2777', bubble: '#db2777' },
  { name: 'Teal', primary: '#0d9488', bubble: '#0d9488' },
  { name: 'Black', primary: '#1f2937', bubble: '#1f2937' },
]

const BG_PRESETS = [
  { name: 'Light', value: '#f9fafb' },
  { name: 'White', value: '#ffffff' },
  { name: 'Cream', value: '#faf7f0' },
  { name: 'Slate', value: '#1e293b' },
  { name: 'Dark', value: '#0f0d1a' },
]

const FONT_PRESETS = [
  { name: 'System', value: 'system', css: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' },
  { name: 'Inter', value: 'inter', css: '"Inter", sans-serif' },
  { name: 'Poppins', value: 'poppins', css: '"Poppins", sans-serif' },
  { name: 'Rounded', value: 'rounded', css: '"Nunito", sans-serif' },
  { name: 'Serif', value: 'serif', css: 'Georgia, serif' },
  { name: 'Mono', value: 'mono', css: '"SF Mono", Menlo, monospace' },
]

export default function CreateAgent() {
  const [step, setStep] = useState(1)
  const [websiteUrl, setWebsiteUrl] = useState('')
  const [businessName, setBusinessName] = useState('')
  const [businessEmail, setBusinessEmail] = useState('')
  const [extraInfo, setExtraInfo] = useState('')
  const [greeting, setGreeting] = useState('Hi! How can I help you today?')
  const [selectedColor, setSelectedColor] = useState(COLOR_PRESETS[0])
  const [customColor, setCustomColor] = useState('')
  const [selectedBg, setSelectedBg] = useState(BG_PRESETS[0])
  const [customBg, setCustomBg] = useState('')
  const [selectedFont, setSelectedFont] = useState(FONT_PRESETS[0])
  const [scrapeStatus, setScrapeStatus] = useState('idle')
  const [scrapeData, setScrapeData] = useState(null)
  const [error, setError] = useState('')

  const handleScrape = useCallback(async () => {
    setScrapeStatus('loading')
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
        throw new Error(data.error || 'Failed to scan website')
      }
      const data = await res.json()
      setScrapeData(data)
      if (data.title) setBusinessName(data.title)
      setScrapeStatus('done')
      setStep(2)
    } catch (err) {
      setError(err.message)
      setScrapeStatus('error')
    }
  }, [websiteUrl])

  const activeColor = customColor || selectedColor.primary
  const activeBg = customBg || selectedBg.value
  const activeFont = selectedFont.value
  const activeFontCss = selectedFont.css

  // Is the chosen background light or dark? (drives preview bubble/text colours)
  const bgIsLight = (() => {
    const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(activeBg)
    if (!m) return true
    const r = parseInt(m[1], 16), g = parseInt(m[2], 16), b = parseInt(m[3], 16)
    return (0.299 * r + 0.587 * g + 0.114 * b) > 150
  })()

  const embedCode = `<script src="https://my-assistant-ashy.vercel.app/widget.js" data-color="${activeColor}" data-bg="${activeBg}" data-font="${activeFont}" data-name="${businessName || 'AI Assistant'}" data-greeting="${greeting}" data-business-email="${businessEmail}"${extraInfo ? ` data-extra-context="${extraInfo.replace(/"/g, '&quot;')}"` : ''}></script>`

  const previewMessages = [
    { role: 'bot', text: greeting },
    { role: 'user', text: 'What services do you offer?' },
    { role: 'bot', text: scrapeData ? `Based on ${businessName || 'your website'}, I can help answer questions about your business. Ask me anything!` : 'I can help answer questions about your business. Ask me anything!' },
  ]

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <nav className="border-b border-gray-200 bg-white px-8 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <a href="/" className="text-xl font-bold text-gray-900">
            <span style={{ color: activeColor }}>&gt;_</span> My Assistant
          </a>
          <span className="text-sm text-gray-500">Create Your Agent</span>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-8 py-12">
        {/* Progress bar */}
        <div className="flex items-center gap-2 mb-10 max-w-md">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center flex-1">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                  step >= s ? 'text-white' : 'bg-gray-200 text-gray-500'
                }`}
                style={step >= s ? { backgroundColor: activeColor } : {}}
              >
                {step > s ? '✓' : s}
              </div>
              {s < 3 && (
                <div className={`flex-1 h-1 mx-2 rounded ${step > s ? 'bg-gray-800' : 'bg-gray-200'}`}
                  style={step > s ? { backgroundColor: activeColor } : {}}
                />
              )}
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Left: Form */}
          <div>
            {/* Step 1: Website URL */}
            {step === 1 && (
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Connect your website</h1>
                <p className="text-gray-600 mb-8">We'll scan your site so your AI agent knows everything about your business.</p>

                <label className="block text-sm font-medium text-gray-700 mb-2">Website URL</label>
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={websiteUrl}
                    onChange={(e) => setWebsiteUrl(e.target.value)}
                    placeholder="yourwebsite.com"
                    className="flex-1 px-4 py-3 rounded-lg border border-gray-300 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    onKeyDown={(e) => e.key === 'Enter' && websiteUrl.trim() && handleScrape()}
                  />
                  <button
                    onClick={handleScrape}
                    disabled={!websiteUrl.trim() || scrapeStatus === 'loading'}
                    className="px-6 py-3 text-white rounded-lg font-semibold transition-colors disabled:opacity-50"
                    style={{ backgroundColor: activeColor }}
                  >
                    {scrapeStatus === 'loading' ? 'Scanning...' : 'Scan'}
                  </button>
                </div>
                {error && <p className="mt-3 text-red-600 text-sm">{error}</p>}

                <button
                  onClick={() => setStep(2)}
                  className="mt-6 text-sm text-gray-500 hover:text-gray-700 underline"
                >
                  Skip — I'll add info manually
                </button>
              </div>
            )}

            {/* Step 2: Customize */}
            {step === 2 && (
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Customize your agent</h1>
                <p className="text-gray-600 mb-8">Pick your colours and add any extra info your agent should know.</p>

                {/* Business name */}
                <label className="block text-sm font-medium text-gray-700 mb-2">Agent name</label>
                <input
                  type="text"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="e.g. Acme Support"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent mb-6"
                />

                {/* Greeting */}
                <label className="block text-sm font-medium text-gray-700 mb-2">Greeting message</label>
                <input
                  type="text"
                  value={greeting}
                  onChange={(e) => setGreeting(e.target.value)}
                  placeholder="Hi! How can I help you today?"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent mb-6"
                />

                {/* Colour picker */}
                <label className="block text-sm font-medium text-gray-700 mb-3">Colour scheme</label>
                <div className="flex flex-wrap gap-3 mb-3">
                  {COLOR_PRESETS.map((color) => (
                    <button
                      key={color.name}
                      onClick={() => { setSelectedColor(color); setCustomColor('') }}
                      className={`w-10 h-10 rounded-full border-2 transition-transform hover:scale-110 ${
                        selectedColor.name === color.name && !customColor ? 'border-gray-900 scale-110' : 'border-transparent'
                      }`}
                      style={{ backgroundColor: color.primary }}
                      title={color.name}
                      aria-label={`Select ${color.name} colour`}
                    />
                  ))}
                </div>
                <div className="flex items-center gap-3 mb-6">
                  <label className="text-sm text-gray-500">Custom:</label>
                  <input
                    type="color"
                    value={customColor || selectedColor.primary}
                    onChange={(e) => setCustomColor(e.target.value)}
                    className="w-10 h-10 rounded cursor-pointer border border-gray-300"
                  />
                  <span className="text-sm text-gray-500 font-mono">{customColor || selectedColor.primary}</span>
                </div>

                {/* Background colour picker */}
                <label className="block text-sm font-medium text-gray-700 mb-3">Background colour</label>
                <div className="flex flex-wrap gap-3 mb-3">
                  {BG_PRESETS.map((bg) => (
                    <button
                      key={bg.name}
                      onClick={() => { setSelectedBg(bg); setCustomBg('') }}
                      className={`w-10 h-10 rounded-full border-2 transition-transform hover:scale-110 ${
                        selectedBg.name === bg.name && !customBg ? 'border-gray-900 scale-110' : 'border-gray-200'
                      }`}
                      style={{ backgroundColor: bg.value }}
                      title={bg.name}
                      aria-label={`Select ${bg.name} background`}
                    />
                  ))}
                </div>
                <div className="flex items-center gap-3 mb-6">
                  <label className="text-sm text-gray-500">Custom:</label>
                  <input
                    type="color"
                    value={customBg || selectedBg.value}
                    onChange={(e) => setCustomBg(e.target.value)}
                    className="w-10 h-10 rounded cursor-pointer border border-gray-300"
                  />
                  <span className="text-sm text-gray-500 font-mono">{customBg || selectedBg.value}</span>
                </div>

                {/* Font picker */}
                <label className="block text-sm font-medium text-gray-700 mb-3">Font</label>
                <div className="flex flex-wrap gap-2 mb-6">
                  {FONT_PRESETS.map((font) => (
                    <button
                      key={font.value}
                      onClick={() => setSelectedFont(font)}
                      className={`px-4 py-2 rounded-lg text-sm border transition-colors ${
                        selectedFont.value === font.value
                          ? 'border-gray-900 bg-gray-900 text-white'
                          : 'border-gray-300 text-gray-700 hover:bg-gray-100'
                      }`}
                      style={{ fontFamily: font.css }}
                    >
                      {font.name}
                    </button>
                  ))}
                </div>

                {/* Extra info */}
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Extra information <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <p className="text-sm text-gray-500 mb-2">Add anything your agent should know that isn't on your website — opening hours, special offers, FAQs, etc.</p>
                <textarea
                  value={extraInfo}
                  onChange={(e) => setExtraInfo(e.target.value)}
                  placeholder="e.g. We're open Mon-Fri 9am-5pm. Free shipping on orders over $50. Returns accepted within 30 days."
                  rows={4}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none mb-6"
                />

                {/* Business email for reports */}
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your email <span className="text-gray-400 font-normal">(for daily reports)</span>
                </label>
                <p className="text-sm text-gray-500 mb-2">We'll send you a daily summary of questions your agent couldn't answer so you can improve it.</p>
                <input
                  type="email"
                  value={businessEmail}
                  onChange={(e) => setBusinessEmail(e.target.value)}
                  placeholder="you@yourbusiness.com"
                  required
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent mb-6"
                />

                <div className="flex gap-3">
                  <button
                    onClick={() => setStep(1)}
                    className="px-5 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-100 transition-colors"
                  >
                    Back
                  </button>
                  <button
                    onClick={() => setStep(3)}
                    disabled={!businessEmail.trim()}
                    className="px-6 py-3 text-white rounded-lg font-semibold transition-colors disabled:opacity-50"
                    style={{ backgroundColor: activeColor }}
                  >
                    Get My Code
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Get code */}
            {step === 3 && (
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Your agent is ready!</h1>
                <p className="text-gray-600 mb-8">Copy this code and paste it before the closing &lt;/body&gt; tag on your website.</p>

                <div className="relative">
                  <pre className="bg-gray-900 text-green-400 text-sm p-5 rounded-xl overflow-x-auto border border-gray-700">
                    <code>{embedCode}</code>
                  </pre>
                  <button
                    onClick={() => navigator.clipboard?.writeText(embedCode)}
                    className="absolute top-3 right-3 px-4 py-1.5 bg-white/10 hover:bg-white/20 text-white text-sm rounded-md font-medium transition-colors"
                  >
                    Copy
                  </button>
                </div>

                {scrapeData && (
                  <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-green-800 text-sm font-medium">✓ Website data loaded</p>
                    <p className="text-green-700 text-sm mt-1">
                      {scrapeData.content?.length || 0} characters of content scraped from your site. Your agent will automatically read the page it's embedded on.
                    </p>
                  </div>
                )}

                {extraInfo && (
                  <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-blue-800 text-sm font-medium">✓ Extra info included</p>
                    <p className="text-blue-700 text-sm mt-1">Your custom information will be passed to the agent alongside the page content.</p>
                  </div>
                )}

                <div className="flex gap-3 mt-8">
                  <button
                    onClick={() => setStep(2)}
                    className="px-5 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-100 transition-colors"
                  >
                    Back
                  </button>
                  <a
                    href="/"
                    className="px-6 py-3 text-white rounded-lg font-semibold transition-colors inline-block"
                    style={{ backgroundColor: activeColor }}
                  >
                    Done
                  </a>
                </div>
              </div>
            )}
          </div>

          {/* Right: Live Preview */}
          <div className="hidden lg:block">
            <p className="text-sm font-medium text-gray-500 mb-4">Live Preview</p>
            <div className="border border-gray-200 rounded-2xl overflow-hidden shadow-lg bg-white" style={{ height: '520px', fontFamily: activeFontCss }}>
              {/* Chat header */}
              <div className="px-5 py-4 flex items-center gap-3" style={{ backgroundColor: activeColor }}>
                <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-sm">
                  {(businessName || 'A').charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="text-white font-semibold text-sm">{businessName || 'AI Assistant'}</div>
                  <div className="text-white/70 text-xs flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-green-300 inline-block"></span>
                    Online
                  </div>
                </div>
              </div>

              {/* Messages area */}
              <div className="p-4 flex flex-col gap-3 flex-1 overflow-y-auto" style={{ height: '380px', backgroundColor: activeBg }}>
                {/* Date divider */}
                <div className="text-center">
                  <span className="text-xs px-3 py-1 rounded-full shadow-sm" style={{ color: bgIsLight ? '#9ca3af' : 'rgba(255,255,255,0.6)', backgroundColor: bgIsLight ? '#ffffff' : 'rgba(255,255,255,0.08)' }}>Today</span>
                </div>

                {previewMessages.map((msg, i) => (
                  <div key={i} className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className={`max-w-[80%] min-w-0 px-[15px] py-[11px] shadow-sm ${
                        msg.role === 'user'
                          ? 'rounded-[18px] rounded-br-[4px] text-white'
                          : 'rounded-[18px] rounded-bl-[4px]'
                      }`}
                      style={msg.role === 'user'
                        ? { backgroundColor: activeColor }
                        : { backgroundColor: bgIsLight ? '#ffffff' : 'rgba(255,255,255,0.10)', color: bgIsLight ? '#1f2937' : '#e5e7eb', border: bgIsLight ? '1px solid #f0f0f0' : 'none' }}
                    >
                      <span className="block text-[14px] leading-[1.5]" style={{ overflowWrap: 'break-word', wordBreak: 'break-word', whiteSpace: 'pre-wrap' }}>{msg.text}</span>
                      <span className="block text-[10.5px] mt-[4px] text-right" style={{ color: msg.role === 'user' ? 'rgba(255,255,255,0.6)' : (bgIsLight ? '#9ca3af' : 'rgba(255,255,255,0.45)') }}>
                        {i === 0 ? '12:00' : i === 1 ? '12:01' : '12:01'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Input area */}
              <div className="px-4 py-3 border-t flex items-center gap-2" style={{ backgroundColor: bgIsLight ? '#ffffff' : activeBg, borderColor: bgIsLight ? '#e5e7eb' : 'rgba(255,255,255,0.08)' }}>
                <div className="flex-1 px-4 py-2.5 rounded-full text-sm" style={{ backgroundColor: bgIsLight ? '#f3f4f6' : 'rgba(255,255,255,0.10)', color: bgIsLight ? '#9ca3af' : 'rgba(255,255,255,0.4)' }}>
                  Type a message...
                </div>
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-white"
                  style={{ backgroundColor: activeColor }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
