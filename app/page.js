import { Navbar } from '@/components/navbar'
import { FeatureCard } from '@/components/feature-card'
import { StepCard } from '@/components/step-card'
import { PricingCard } from '@/components/pricing-card'
import { EmailSignupForm } from '@/components/email-signup-form'
import { FEATURES, STEPS, PRICING_TIERS } from '@/lib/constants'

export const metadata = {
  title: 'My Assistant — Your Business, Your AI Agent',
  description: 'A custom AI assistant trained on your business data. Answers customer questions 24/7. Set up in minutes.',
}

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-purple-600 focus:text-white focus:rounded-lg"
      >
        Skip to content
      </a>

      <Navbar />

      {/* Hero */}
      <section id="main-content" className="max-w-7xl mx-auto px-8 py-20 text-center">
        <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
          Your Business.
          <br />
          <span className="text-purple-400">Your AI Agent.</span>
        </h1>
        <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-10">
          A custom AI assistant trained on your business data. Answers customer
          questions 24/7. Set up in minutes, not months.
        </p>
        <EmailSignupForm />
        <p className="text-gray-500 mt-4 text-sm">No credit card required. Free tier available.</p>
      </section>

      {/* Features */}
      <section id="features" aria-labelledby="features-heading" className="max-w-7xl mx-auto px-8 py-20">
        <h2 id="features-heading" className="text-3xl font-bold text-white text-center mb-12">
          Why Businesses Choose My Assistant
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          {FEATURES.map((feature) => (
            <FeatureCard key={feature.title} {...feature} />
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" aria-labelledby="steps-heading" className="max-w-7xl mx-auto px-8 py-20">
        <h2 id="steps-heading" className="text-3xl font-bold text-white text-center mb-12">
          How It Works
        </h2>
        <div className="grid md:grid-cols-4 gap-8">
          {STEPS.map((step) => (
            <StepCard key={step.number} {...step} />
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" aria-labelledby="pricing-heading" className="max-w-7xl mx-auto px-8 py-20">
        <h2 id="pricing-heading" className="text-3xl font-bold text-white text-center mb-12">
          Simple Pricing
        </h2>
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {PRICING_TIERS.map((tier) => (
            <PricingCard key={tier.tier} {...tier} />
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 mt-20 py-8 text-center text-gray-500">
        <p>&copy; 2026 My Assistant. All rights reserved.</p>
      </footer>
    </main>
  )
}
