'use client'

import { useState } from 'react'
import { Navbar } from '@/components/navbar'
import { FeatureCard } from '@/components/feature-card'
import { StepCard } from '@/components/step-card'
import { PricingCard } from '@/components/pricing-card'
import { EmailSignupForm } from '@/components/email-signup-form'
import { MatrixRain } from '@/components/matrix-rain'
import { DemoChatBot } from '@/components/demo-chat-bot'
import { InstallModal } from '@/components/install-modal'
import { useThemeStyles } from '@/components/theme-provider'
import { FEATURES, STEPS, PRICING_TIERS } from '@/lib/constants'

export default function Home() {
  const t = useThemeStyles()
  const [installOpen, setInstallOpen] = useState(false)

  return (
    <main className={`min-h-screen ${t.bgGradient} relative`}>
      <MatrixRain />

      <div className="relative z-10">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-purple-600 focus:text-white focus:rounded-lg"
        >
          Skip to content
        </a>

        <Navbar />

        {/* Hero */}
        <section id="maitent" className="max-w-7xl mx-auto px-8 py-20 text-center">
          <div className={`inline-block px-4 py-1.5 rounded-full border ${t.accentBorder} ${t.accent} text-sm mb-8 ${t.font}`}>
            AI-Powered Customer Support
          </div>
          <h1 className={`text-5xl md:text-7xl font-bold ${t.text} mb-6 ${t.font}`}>
            Your Business.
            <br />
            <span className={t.accent}>Your AI Agent.</span>
          </h1>
          <p className={`text-xl ${t.textMuted} max-w-2xl mx-auto mb-10`}>
            A custom AI assistant trained on your business data. Answers customer
            questions 24/7. Set up in minutes, not months.
          </p>
          <EmailSignupForm />
          <div className="mt-6 flex items-center justify-center gap-3 flex-wrap">
            <button
              onClick={() => setInstallOpen(true)}
              className={`px-6 py-3 ${t.accentBg} ${t.accentHover} text-white rounded-lg font-semibold transition-colors shadow-lg ${t.glow} flex items-center gap-2`}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 5v14M5 12h14"/>
              </svg>
              Install on Your Website
            </button>
            <span className={`${t.textSubtle} text-sm`}>or</span>
            <a
              href="/dashboard"
              className={`px-6 py-3 border ${t.accentBorder} ${t.accent} rounded-lg font-semibold hover:bg-white/5 transition-colors`}
            >
              Open Dashboard
            </a>
          </div>
          <p className={`${t.textSubtle} mt-4 text-sm`}>$20.50/week. Cancel anytime.</p>
        </section>

        {/* Features */}
        <section id="features" aria-labelledby="features-heading" className="max-w-7xl mx-auto px-8 py-20">
          <h2 id="features-heading" className={`text-3xl font-bold ${t.text} text-center mb-4 ${t.font}`}>
            Why Businesses Choose My Assistant
          </h2>
          <p className={`${t.textMuted} text-center mb-12 max-w-xl mx-auto`}>
            Everything you need to automate customer support and capture more leads.
          </p>
          <div className="grid md:grid-cols-3 gap-8">
            {FEATURES.map((feature) => (
              <FeatureCard key={feature.title} {...feature} />
            ))}
          </div>
        </section>

        {/* How It Works */}
        <section id="how-it-works" aria-labelledby="steps-heading" className="max-w-7xl mx-auto px-8 py-20">
          <h2 id="steps-heading" className={`text-3xl font-bold ${t.text} text-center mb-4 ${t.font}`}>
            How It Works
          </h2>
          <p className={`${t.textMuted} text-center mb-12 max-w-xl mx-auto`}>
            From zero to live AI agent in four simple steps.
          </p>
          <div className="grid md:grid-cols-4 gap-8">
            {STEPS.map((step) => (
              <StepCard key={step.number} {...step} />
            ))}
          </div>
        </section>

        {/* Pricing */}
        <section id="pricing" aria-labelledby="pricing-heading" className="max-w-7xl mx-auto px-8 py-20">
          <h2 id="pricing-heading" className={`text-3xl font-bold ${t.text} text-center mb-4 ${t.font}`}>
            Simple Pricing
          </h2>
          <p className={`${t.textMuted} text-center mb-12 max-w-xl mx-auto`}>
            One plan. One price. Everything included.
          </p>
          <div className="max-w-md mx-auto">
            {PRICING_TIERS.map((tier) => (
              <PricingCard key={tier.tier} {...tier} />
            ))}
          </div>
        </section>

        {/* Footer */}
        <footer className={`border-t ${t.navBorder} mt-20 py-8 text-center ${t.textSubtle}`}>
          <p>&copy; 2026 My Assistant. All rights reserved.</p>
        </footer>
      </div>

      {/* Floating AI Chat Demo */}
      <DemoChatBot />

      {/* Install Modal */}
      <InstallModal isOpen={installOpen} onClose={() => setInstallOpen(false)} />
    </main>
  )
}
