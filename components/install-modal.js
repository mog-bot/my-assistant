'use client'

import { useState, useCallback } from 'react'
import { useThemeStyles } from './theme-provider'

const PLATFORMS = [
  {
    id: 'wordpress',
    name: 'WordPress',
    steps: [
      'Log in to your WordPress admin dashboard',
      'Install the free "Insert Headers and Footers" plugin (Plugins → Add New)',
      'Go to Settings → Insert Headers and Footers',
      'Paste the code below into the "Scripts in Footer" box',
      'Click Save. Done.',
    ],
  },
  {
    id: 'shopify',
    name: 'Shopify',
    steps: [
      'Go to your Shopify admin',
      'Click Online Store → Themes',
      'Click the three dots next to your theme → Edit Code',
      'Open theme.liquid and paste the code right before </body>',
      'Click Save. Done.',
    ],
  },
  {
    id: 'wix',
    name: 'Wix',
    steps: [
      'Go to your Wix dashboard',
      'Click Settings → Custom Code',
      'Click + Add Custom Code',
      'Paste the code, set "Place Code in" to "Body - end"',
      'Apply to All pages → Click Apply.',
    ],
  },
  {
    id: 'squarespace',
    name: 'Squarespace',
    steps: [
      'Go to Settings → Advanced → Code Injection',
      'Paste the code into the Footer section',
      'Click Save. Done.',
    ],
  },
  {
    id: 'webflow',
    name: 'Webflow',
    steps: [
      'Go to Project Settings → Custom Code',
      'Paste the code into the "Footer Code" section',
      'Click Save Changes → Publish your site.',
    ],
  },
  {
    id: 'html',
    name: 'HTML / Other',
    steps: [
      'Open your website\'s HTML file',
      'Find the closing </body> tag',
      'Paste the code right before it',
      'Save and upload to your server.',
    ],
  },
]

export function InstallModal({ isOpen, onClose }) {
  const t = useThemeStyles()
  const [activePlatform, setActivePlatform] = useState('wordpress')
  const [copied, setCopied] = useState(false)
  const [emailSending, setEmailSending] = useState(false)
  const [emailSent, setEmailSent] = useState(false)
  const [devEmail, setDevEmail] = useState('')

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://my-assistant-bhre.vercel.app'
  const embedCode = `<script src="${baseUrl}/widget.js" data-agent-id="demo"></script>`

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(embedCode)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback for browsers without clipboard API
      const textarea = document.createElement('textarea')
      textarea.value = embedCode
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }, [embedCode])

  const handleEmailDev = useCallback((e) => {
    e.preventDefault()
    if (!devEmail.trim()) return

    setEmailSending(true)
    const subject = encodeURIComponent('Please install My Assistant on our website')
    const body = encodeURIComponent(
      `Hi,\n\nPlease add the following code to our website. It enables an AI chatbot from My Assistant.\n\nInstallation: Paste this code right before the closing </body> tag on every page (or in the site's global footer/code injection settings).\n\nCode:\n${embedCode}\n\nMore info: ${baseUrl}\n\nThanks!`
    )
    window.location.href = `mailto:${devEmail.trim()}?subject=${subject}&body=${body}`
    setTimeout(() => {
      setEmailSending(false)
      setEmailSent(true)
      setTimeout(() => setEmailSent(false), 3000)
    }, 500)
  }, [devEmail, embedCode, baseUrl])

  if (!isOpen) return null

  const platform = PLATFORMS.find((p) => p.id === activePlatform) || PLATFORMS[0]

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Install My Assistant"
    >
      <div
        className={`relative ${t.cardBg} border ${t.cardBorder} rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl ${t.glowStrong}`}
        onClick={(e) => e.stopPropagation()}
        style={{ background: '#0f0d1a' }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors z-10"
        >
          ×
        </button>

        <div className="p-8">
          <h2 className={`text-2xl font-bold ${t.text} mb-2 ${t.font}`}>
            Install in Under 60 Seconds
          </h2>
          <p className={`${t.textMuted} mb-6`}>
            Choose your platform — we&apos;ll show you exactly where to paste the code.
          </p>

          {/* Step 1: Copy Code */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-3">
              <span className={`w-7 h-7 ${t.accentBg} rounded-full flex items-center justify-center text-white font-bold text-sm`}>1</span>
              <h3 className={`font-semibold ${t.text}`}>Copy your code</h3>
            </div>
            <div className="relative">
              <pre className={`${t.codeBg} ${t.codeText} text-sm p-4 pr-24 rounded-lg overflow-x-auto border ${t.cardBorder}`}>
                <code>{embedCode}</code>
              </pre>
              <button
                onClick={handleCopy}
                className={`absolute top-3 right-3 px-4 py-1.5 ${
                  copied ? 'bg-green-600' : t.accentBg
                } text-white text-sm rounded-md font-semibold transition-colors`}
              >
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </div>

          {/* Step 2: Pick Platform */}
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-3">
              <span className={`w-7 h-7 ${t.accentBg} rounded-full flex items-center justify-center text-white font-bold text-sm`}>2</span>
              <h3 className={`font-semibold ${t.text}`}>Choose your platform</h3>
            </div>
            <div className="flex flex-wrap gap-2 mb-4">
              {PLATFORMS.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setActivePlatform(p.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activePlatform === p.id
                      ? `${t.accentBg} text-white`
                      : `bg-white/5 ${t.textMuted} hover:bg-white/10`
                  }`}
                >
                  {p.name}
                </button>
              ))}
            </div>
          </div>

          {/* Step 3: Follow Steps */}
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-3">
              <span className={`w-7 h-7 ${t.accentBg} rounded-full flex items-center justify-center text-white font-bold text-sm`}>3</span>
              <h3 className={`font-semibold ${t.text}`}>Follow these steps for {platform.name}</h3>
            </div>
            <ol className="space-y-2.5 ml-2">
              {platform.steps.map((step, i) => (
                <li key={i} className={`flex gap-3 ${t.textMuted} text-sm`}>
                  <span className={`${t.accent} font-semibold shrink-0`}>{i + 1}.</span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </div>

          {/* Email to Developer */}
          <div className={`border-t ${t.cardBorder} pt-6 mt-6`}>
            <h3 className={`font-semibold ${t.text} mb-2`}>Not technical? Email it to your developer.</h3>
            <p className={`${t.textMuted} text-sm mb-3`}>
              We&apos;ll prepare an email with the code and instructions — you just hit send.
            </p>
            <form onSubmit={handleEmailDev} className="flex flex-col sm:flex-row gap-2">
              <input
                type="email"
                value={devEmail}
                onChange={(e) => setDevEmail(e.target.value)}
                placeholder="developer@example.com"
                required
                className={`flex-1 px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-purple-400`}
              />
              <button
                type="submit"
                disabled={emailSending || !devEmail.trim()}
                className={`px-5 py-2.5 ${t.accentBg} text-white rounded-lg text-sm font-semibold transition-colors disabled:opacity-50`}
              >
                {emailSent ? 'Email opened!' : emailSending ? 'Opening...' : 'Email Code'}
              </button>
            </form>
          </div>

          {/* Help */}
          <p className={`${t.textSubtle} text-xs text-center mt-6`}>
            Stuck? Open the chat in the bottom-right corner — our AI will walk you through it.
          </p>
        </div>
      </div>
    </div>
  )
}
