'use client'

import { DemoPreviewChat } from '@/components/demo-preview-chat'
import { useThemeStyles } from '@/components/theme-provider'
import { MatrixRain } from '@/components/matrix-rain'
import Link from 'next/link'

export function DemoPreviewPage({ business }) {
  const t = useThemeStyles()

  return (
    <main className={`min-h-screen ${t.bgGradient} relative`}>
      <MatrixRain />

      <div className="relative z-10">
        {/* Top banner */}
        <div className="w-full bg-black/40 backdrop-blur-sm border-b border-white/10 py-3 px-6 text-center text-sm">
          <span className={t.textMuted}>
            This is a live demo built by{' '}
            <Link href="/" className={`${t.accent} font-semibold hover:underline`}>
              My Assistant
            </Link>
            {' '}for {business.name} — not affiliated with or endorsed by the business
          </span>
        </div>

        <div className="max-w-6xl mx-auto px-6 py-12">
          {/* Hero */}
          <div className="text-center mb-10">
            <div
              className="inline-block px-4 py-1.5 rounded-full text-sm mb-6 font-semibold"
              style={{ background: `${business.color}20`, color: business.color, border: `1px solid ${business.color}40` }}
            >
              Built for {business.name}
            </div>
            <h1 className={`text-4xl md:text-6xl font-bold ${t.text} mb-4`}>
              Your customers,
              <br />
              <span style={{ color: business.color }}>answered instantly</span>
            </h1>
            <p className={`text-lg ${t.textMuted} max-w-2xl mx-auto mb-2`}>
              This is a working AI assistant we built for {business.name} using information from {business.website}.
            </p>
            <p className={`${t.textSubtle} text-sm`}>
              Try it below — ask about menu items, hours, locations, or anything else.
            </p>
          </div>

          {/* Chat Demo */}
          <div className="max-w-2xl mx-auto mb-16">
            <DemoPreviewChat business={business} />
          </div>

          {/* Value Prop */}
          <div className={`${t.cardBg} border ${t.cardBorder} rounded-2xl p-8 md:p-12 mb-12`}>
            <h2 className={`text-3xl font-bold ${t.text} text-center mb-8`}>
              Why {business.name} needs this
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div
                  className="w-14 h-14 rounded-full mx-auto mb-4 flex items-center justify-center text-xl font-bold text-white"
                  style={{ background: business.color }}
                >
                  24/7
                </div>
                <h3 className={`font-semibold ${t.text} mb-2`}>Answers while you sleep</h3>
                <p className={`${t.textMuted} text-sm`}>
                  Customers ask about hours, menu, bookings at all times. Your AI answers instantly, even at 3am.
                </p>
              </div>
              <div className="text-center">
                <div
                  className="w-14 h-14 rounded-full mx-auto mb-4 flex items-center justify-center text-white"
                  style={{ background: business.color }}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
                  </svg>
                </div>
                <h3 className={`font-semibold ${t.text} mb-2`}>Trained on your business</h3>
                <p className={`${t.textMuted} text-sm`}>
                  We scraped {business.website} so it already knows your menu, hours, and FAQs. No training required.
                </p>
              </div>
              <div className="text-center">
                <div
                  className="w-14 h-14 rounded-full mx-auto mb-4 flex items-center justify-center text-white"
                  style={{ background: business.color }}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z"/>
                  </svg>
                </div>
                <h3 className={`font-semibold ${t.text} mb-2`}>Installed in 60 seconds</h3>
                <p className={`${t.textMuted} text-sm`}>
                  One line of code. Works on your existing website. No redesign, no developer needed.
                </p>
              </div>
            </div>
          </div>

          {/* Pricing + CTA */}
          <div className={`${t.cardBg} border ${t.cardBorder} rounded-2xl p-8 md:p-12 text-center`}>
            <h2 className={`text-3xl font-bold ${t.text} mb-3`}>Get this on your website</h2>
            <p className={`${t.textMuted} mb-6`}>
              One simple plan. Everything included.
            </p>
            <div className="mb-6">
              <span className={`text-5xl font-bold ${t.text}`}>$20.50</span>
              <span className={`text-xl ${t.textMuted}`}>/week</span>
            </div>
            <ul className={`${t.textMuted} space-y-2 mb-8 inline-block text-left`}>
              <li className="flex items-center gap-2">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={business.color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                Your own custom AI agent
              </li>
              <li className="flex items-center gap-2">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={business.color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                Trained on your business data
              </li>
              <li className="flex items-center gap-2">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={business.color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                Unlimited messages, unlimited conversations
              </li>
              <li className="flex items-center gap-2">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={business.color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                One-click install on any website
              </li>
              <li className="flex items-center gap-2">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={business.color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                Lead capture, custom branding, priority support
              </li>
            </ul>
            <div>
              <a
                href={`mailto:mog@my-assistant.com?subject=${encodeURIComponent('Ready to activate AI Assistant for ' + business.name)}&body=${encodeURIComponent('Hi,\n\nI saw the live demo of the AI assistant built for us at ' + business.name + '.\n\nI\'d like to activate it on our website. Please send payment details and setup instructions.\n\nBest regards,')}`}
                className="inline-block px-8 py-4 text-white font-bold rounded-lg transition-opacity hover:opacity-90 text-lg shadow-lg"
                style={{ background: business.color }}
              >
                Activate for {business.name}
              </a>
              <p className={`${t.textSubtle} text-xs mt-4`}>
                Cancel anytime. Setup done for you.
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center mt-12">
            <p className={`${t.textSubtle} text-sm`}>
              Powered by{' '}
              <Link href="/" className={`${t.accent} hover:underline`}>
                My Assistant
              </Link>
              {' — '}AI agents for small businesses
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}
