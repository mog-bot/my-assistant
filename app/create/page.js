'use client'

import { useState, useCallback } from 'react'

const COLOR_PRESETS = [
  { name: 'Purple', primary: '#7c3aed' },
  { name: 'Blue', primary: '#2563eb' },
  { name: 'Green', primary: '#16a34a' },
  { name: 'Red', primary: '#dc2626' },
  { name: 'Orange', primary: '#ea580c' },
  { name: 'Pink', primary: '#db2777' },
  { name: 'Teal', primary: '#0d9488' },
  { name: 'Black', primary: '#1f2937' },
]

const BG_PRESETS = [
  { name: 'Light', value: '#f0f2f5' },
  { name: 'White', value: '#ffffff' },
  { name: 'Cream', value: '#faf7f0' },
]

const FONT_PRESETS = [
  { name: 'System', value: 'system', css: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' },
  { name: 'Inter', value: 'inter', css: '"Inter", sans-serif' },
  { name: 'Poppins', value: 'poppins', css: '"Poppins", sans-serif' },
  { name: 'Rounded', value: 'rounded', css: '"Nunito", sans-serif' },
  { name: 'Serif', value: 'serif', css: 'Georgia, serif' },
  { name: 'Mono', value: 'mono', css: '"SF Mono", Menlo, monospace' },
]

const ICON_PRESETS = [
  { label: '💬', title: 'Chat bubble' },
  { label: '🤖', title: 'Robot' },
  { label: '✨', title: 'Sparkle' },
  { label: '❓', title: 'Question' },
  { label: '👋', title: 'Wave' },
  { label: '💡', title: 'Idea' },
  { label: '🛎️', title: 'Bell' },
  { label: '⚡', title: 'Lightning' },
]

const PLATFORMS = [
  { id: 'wix',         name: 'Wix' },
  { id: 'squarespace', name: 'Squarespace' },
  { id: 'shopify',     name: 'Shopify' },
  { id: 'wordpress',   name: 'WordPress' },
  { id: 'webflow',     name: 'Webflow' },
  { id: 'framer',      name: 'Framer' },
  { id: 'html',        name: 'Plain HTML' },
  { id: 'other',       name: 'Other' },
]

const PLATFORM_INSTRUCTIONS = {
  wix: [
    'Open your Wix dashboard and go to your site',
    'Click Settings in the left menu',
    'Select Custom Code under Advanced',
    'Click + Add Code, choose Body — end of tag',
    'Paste your code, give it a name, click Apply',
    'Publish your site — your agent is live!',
  ],
  squarespace: [
    'Open your Squarespace dashboard',
    'Go to Settings → Advanced → Code Injection',
    'Scroll down to the Footer section',
    'Paste your code into the Footer box',
    'Click Save — your agent will appear immediately',
  ],
  shopify: [
    'Go to Online Store → Themes in your Shopify admin',
    'Click the ⋯ menu next to your active theme',
    'Select Edit code',
    'Open layout/theme.liquid from the file list',
    'Find the </body> tag near the bottom of the file',
    'Paste your code just before </body> and click Save',
  ],
  wordpress: [
    'In your WordPress admin, go to Plugins → Add New',
    'Search for "Insert Headers and Footers" and install it',
    'Activate the plugin, then go to Settings → Insert Headers and Footers',
    'Paste your code in the Scripts in Footer box',
    'Click Save — your agent will appear on all pages',
  ],
  webflow: [
    'Open your Webflow project and go to Project Settings',
    'Click the Custom Code tab',
    'Scroll to the Footer Code section',
    'Paste your code and click Save Changes',
    'Publish your site to make it live',
  ],
  framer: [
    'Open your Framer project',
    'Go to Site Settings → General',
    'Scroll to Custom Code → end of <body>',
    'Paste your code and click Save',
    'Publish your site — your agent is ready',
  ],
  html: [
    'Open your HTML file in a text or code editor',
    'Scroll to the bottom and find the </body> closing tag',
    'Paste your code on the line just before </body>',
    'Save the file and upload it to your server',
  ],
  other: [
    'Look for a "Custom Code", "Footer Scripts", or "HTML Embed" section in your platform settings',
    'Paste your code there — most platforms inject it before </body> automatically',
    'If you can edit HTML directly, paste it just before the </body> closing tag',
    'Save and publish — your agent should appear within a few seconds',
  ],
}

export default function CreateAgent() {
  const [step, setStep] = useState(1)
  const [websiteUrl, setWebsiteUrl] = useState('')
  const [businessName, setBusinessName] = useState('')
  const [businessEmail, setBusinessEmail] = useState('')
  const [extraInfo, setExtraInfo] = useState('')
  const [greeting, setGreeting] = useState('Hi! How can I help you today?')
  const [selectedColor, setSelectedColor] = useState(COLOR_PRESETS[0])
  const [customColor, setCustomColor] = useState('')
  const [selectedBg, setSelectedBg] = useState({ name: 'Light', value: '#f0f2f5' })
  const [customBg, setCustomBg] = useState('')
  const [selectedFont, setSelectedFont] = useState(FONT_PRESETS[0])
  const [launcherIcon, setLauncherIcon] = useState('')
  const [platform, setPlatform] = useState('')
  const [detectedPlatform, setDetectedPlatform] = useState('')
  const [scrapeStatus, setScrapeStatus] = useState('idle')
  const [scrapeData, setScrapeData] = useState(null)
  const [error, setError] = useState('')
  const [helpQuestion, setHelpQuestion] = useState('')
  const [helpAnswer, setHelpAnswer] = useState('')
  const [helpLoading, setHelpLoading] = useState(false)

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
      if (data.platform) {
        setPlatform(data.platform)
        setDetectedPlatform(data.platform)
      }
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

  // Is the chosen background light or dark?
  const bgIsLight = (() => {
    const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(activeBg)
    if (!m) return true
    const r = parseInt(m[1], 16), g = parseInt(m[2], 16), b = parseInt(m[3], 16)
    return (0.299 * r + 0.587 * g + 0.114 * b) > 150
  })()

  const embedCode = [
    `<script src="https://my-assistant-bhre.vercel.app/widget.js"`,
    ` data-color="${activeColor}"`,
    ` data-bg="${activeBg}"`,
    ` data-font="${activeFont}"`,
    ` data-name="${businessName || 'AI Assistant'}"`,
    ` data-greeting="${greeting}"`,
    ` data-business-email="${businessEmail}"`,
    launcherIcon ? ` data-icon="${launcherIcon}"` : '',
    extraInfo ? ` data-extra-context="${extraInfo.replace(/"/g, '&quot;')}"` : '',
    `></script>`,
  ].join('')

  const previewMessages = [
    { role: 'bot', text: greeting },
    { role: 'user', text: 'What services do you offer?' },
    { role: 'bot', text: scrapeData ? `Based on ${businessName || 'your website'}, I can help answer questions about your business. Ask me anything!` : 'I can help answer questions about your business. Ask me anything!' },
  ]

  const activePlatform = PLATFORMS.find(p => p.id === platform)

  const askInstallHelper = useCallback(async () => {
    if (!helpQuestion.trim() || helpLoading) return
    setHelpLoading(true)
    setHelpAnswer('')
    try {
      const platformName = activePlatform?.name || 'your website'
      const steps = platform ? (PLATFORM_INSTRUCTIONS[platform] || []).map((s, i) => `${i+1}. ${s}`).join('\n') : ''
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: helpQuestion,
          context: `You are a friendly installation assistant helping someone add a chat widget to their ${platformName} website.
The installation steps are:
${steps}

The embed code they need to paste is:
${embedCode}

Answer their question clearly and concisely. Be specific to ${platformName}. If they ask where to paste the code, refer to the numbered steps above.`,
          businessName: 'My Assistant Install Helper',
          enableSearch: false,
        }),
      })
      const data = await res.json()
      setHelpAnswer(data.reply || "Sorry, I couldn't get an answer. Please try again.")
    } catch {
      setHelpAnswer('Something went wrong. Please try again.')
    }
    setHelpLoading(false)
  }, [helpQuestion, helpLoading, activePlatform, platform, embedCode])

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
            {/* Step 1: Website URL + Platform picker */}
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

                {/* Platform picker */}
                <div className="mt-8">
                  <label className="block text-sm font-medium text-gray-700 mb-1">What platform is your website on?</label>
                  <p className="text-sm text-gray-500 mb-3">We'll give you step-by-step install instructions tailored to your platform.</p>
                  <div className="grid grid-cols-4 gap-2">
                    {PLATFORMS.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => setPlatform(platform === p.id ? '' : p.id)}
                        className={`relative px-3 py-2.5 rounded-xl text-xs font-medium border-2 transition-all ${
                          platform === p.id
                            ? 'border-gray-900 bg-gray-900 text-white'
                            : 'border-gray-200 text-gray-700 hover:border-gray-800 bg-white hover:bg-gray-50'
                        }`}
                      >
                        {p.name}
                        {detectedPlatform === p.id && (
                          <span className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white" title="Auto-detected" />
                        )}
                      </button>
                    ))}
                  </div>
                  {detectedPlatform && (
                    <p className="mt-2 text-xs text-green-600 font-medium">
                      ✓ Auto-detected: {PLATFORMS.find(p => p.id === detectedPlatform)?.name}
                    </p>
                  )}
                </div>

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
                <p className="text-gray-600 mb-8">Pick your colours, icon, and add any extra info your agent should know.</p>

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

                {/* Launcher icon */}
                <label className="block text-sm font-medium text-gray-700 mb-2">Launcher button icon</label>
                <p className="text-sm text-gray-500 mb-3">Pick a preset or type your own emoji. Leave blank for the default chat bubble.</p>
                <div className="flex flex-wrap gap-2 mb-3">
                  {ICON_PRESETS.map((icon) => (
                    <button
                      key={icon.label}
                      onClick={() => setLauncherIcon(launcherIcon === icon.label ? '' : icon.label)}
                      title={icon.title}
                      className={`w-11 h-11 rounded-xl text-xl flex items-center justify-center border-2 transition-all hover:scale-110 ${
                        launcherIcon === icon.label
                          ? 'border-gray-900 bg-gray-100 scale-110'
                          : 'border-transparent bg-gray-100 hover:bg-gray-200'
                      }`}
                    >
                      {icon.label}
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-3 mb-6">
                  <label className="text-sm text-gray-500 whitespace-nowrap">Custom emoji:</label>
                  <input
                    type="text"
                    value={launcherIcon}
                    onChange={(e) => setLauncherIcon(e.target.value.slice(0, 4))}
                    placeholder="e.g. 🌿"
                    className="w-28 px-3 py-2 rounded-lg border border-gray-300 text-gray-900 text-center text-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                  {launcherIcon && (
                    <button
                      onClick={() => setLauncherIcon('')}
                      className="text-sm text-gray-400 hover:text-gray-600 underline"
                    >
                      Clear
                    </button>
                  )}
                </div>

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
                <p className="text-gray-600 mb-6">Copy this snippet and add it to your website.</p>

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

                {/* Platform picker + install instructions */}
                <div className="mt-5">
                  {!platform ? (
                    <div className="p-5 border-2 border-gray-200 rounded-xl bg-gray-50">
                      <p className="text-gray-800 font-semibold text-sm mb-1">Where are you installing this?</p>
                      <p className="text-gray-500 text-sm mb-4">Pick your platform and we'll show you exactly where to paste the code.</p>
                      <div className="grid grid-cols-4 gap-2">
                        {PLATFORMS.map((p) => (
                          <button
                            key={p.id}
                            onClick={() => setPlatform(p.id)}
                            className="px-3 py-2.5 rounded-xl text-xs font-medium border-2 border-gray-200 text-gray-700 hover:border-gray-800 bg-white hover:bg-gray-50 transition-all"
                          >
                            {p.name}
                          </button>
                        ))}
                      </div>
                      <p className="mt-4 text-xs text-gray-400">Or paste it just before <code className="bg-gray-200 px-1 rounded">&lt;/body&gt;</code> on any other platform.</p>
                    </div>
                  ) : (
                    <div className="p-5 bg-indigo-50 border border-indigo-200 rounded-xl">
                      <div className="flex items-center justify-between mb-4">
                        <p className="text-indigo-900 font-semibold text-sm">
                          How to install on {activePlatform?.name}:
                        </p>
                        <button
                          onClick={() => setPlatform('')}
                          className="text-xs text-indigo-400 hover:text-indigo-700 underline"
                        >
                          Change platform
                        </button>
                      </div>
                      <ol className="space-y-3">
                        {PLATFORM_INSTRUCTIONS[platform].map((instruction, i) => (
                          <li key={i} className="flex items-start gap-3">
                            <span
                              className="flex-shrink-0 w-6 h-6 rounded-full text-white text-xs font-bold flex items-center justify-center mt-0.5"
                              style={{ backgroundColor: activeColor }}
                            >
                              {i + 1}
                            </span>
                            <span className="text-indigo-800 text-sm leading-relaxed">{instruction}</span>
                          </li>
                        ))}
                      </ol>
                      {platform === 'wix' && (
                        <p className="mt-4 text-xs text-indigo-700 bg-indigo-100 rounded-lg px-3 py-2">
                          ⚠️ Use <strong>Settings → Custom Code</strong>, not the HTML embed element — the embed element runs in an iframe which breaks the widget positioning.
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {scrapeData && (
                  <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
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

                {/* AI install helper */}
                <div className="mt-6 p-5 bg-white border-2 border-gray-100 rounded-xl">
                  <p className="text-gray-800 font-semibold text-sm mb-1">Need help installing it?</p>
                  <p className="text-gray-500 text-xs mb-3">Ask the AI — it knows your platform and your code.</p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={helpQuestion}
                      onChange={(e) => setHelpQuestion(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && askInstallHelper()}
                      placeholder={platform ? `e.g. "Where exactly do I paste this on ${activePlatform?.name}?"` : 'e.g. "Where do I paste this code?"'}
                      className="flex-1 px-3 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent"
                      style={{ '--tw-ring-color': activeColor }}
                    />
                    <button
                      onClick={askInstallHelper}
                      disabled={!helpQuestion.trim() || helpLoading}
                      className="px-4 py-2.5 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-50"
                      style={{ backgroundColor: activeColor }}
                    >
                      {helpLoading ? '...' : 'Ask'}
                    </button>
                  </div>
                  {helpAnswer && (
                    <div className="mt-3 p-3 bg-gray-50 rounded-lg text-sm text-gray-800 leading-relaxed border border-gray-200">
                      {helpAnswer}
                    </div>
                  )}
                </div>

                <div className="flex gap-3 mt-6">
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
                      className="max-w-[80%] min-w-0 px-[15px] py-[11px]"
                      style={msg.role === 'user'
                        ? { backgroundColor: activeColor, color: '#fff', borderRadius: '18px', borderBottomRightRadius: '4px' }
                        : { backgroundColor: bgIsLight ? '#ffffff' : 'rgba(255,255,255,0.10)', color: bgIsLight ? '#1f2937' : '#e5e7eb', borderRadius: '18px', borderBottomLeftRadius: '4px', border: bgIsLight ? '1px solid rgba(0,0,0,0.06)' : 'none', boxShadow: '0 1px 3px rgba(0,0,0,0.07)' }}
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

            {/* FAB preview */}
            <div className="mt-4 flex items-center gap-3">
              <p className="text-sm text-gray-500">Launcher button:</p>
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center text-white shadow-lg"
                style={{ backgroundColor: activeColor }}
              >
                {launcherIcon
                  ? <span style={{ fontSize: '26px', lineHeight: 1 }}>{launcherIcon}</span>
                  : <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                }
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
