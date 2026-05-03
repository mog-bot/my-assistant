'use client'

import { useThemeStyles } from './theme-provider'

export function PricingCard({ tier, price, features, highlighted }) {
  const t = useThemeStyles()

  return (
    <div
      className={`rounded-xl p-8 transition-all duration-300 ${
        highlighted
          ? `${t.highlightBg} border-2 ${t.highlightBorder} scale-105 shadow-xl ${t.glowStrong}`
          : `${t.cardBg} border ${t.cardBorder} hover:shadow-lg ${t.glow}`
      }`}
    >
      <h3
        className={`text-xl font-semibold mb-2 ${t.font} ${
          highlighted ? 'text-white' : t.textMuted
        }`}
      >
        {tier}
      </h3>
      <div className={`text-4xl font-bold mb-6 ${highlighted ? 'text-white' : t.text}`}>
        {price}
      </div>
      <ul className="space-y-3">
        {features.map((f, i) => (
          <li
            key={i}
            className={`flex items-center gap-2 ${
              highlighted ? 'text-white/90' : t.textMuted
            }`}
          >
            <svg className={`w-4 h-4 flex-shrink-0 ${highlighted ? 'text-white' : t.checkColor}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M20 6 9 17l-5-5" />
            </svg>
            {f}
          </li>
        ))}
      </ul>
      <button
        className={`w-full mt-8 py-3 rounded-lg font-semibold transition-all duration-200 ${
          highlighted
            ? 'bg-white text-purple-600 hover:bg-gray-100 shadow-lg'
            : `${t.accentBg} text-white ${t.accentHover} shadow-md ${t.glow}`
        }`}
      >
        Get Started
      </button>
    </div>
  )
}
