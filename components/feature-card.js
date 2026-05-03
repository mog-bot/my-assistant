'use client'

import { useThemeStyles } from './theme-provider'
import { FEATURE_ICONS } from './icons'

export function FeatureCard({ icon, title, description }) {
  const t = useThemeStyles()
  const IconComponent = FEATURE_ICONS[title]

  return (
    <div className={`${t.cardBg} border ${t.cardBorder} rounded-xl p-6 ${t.cardHover} transition-all duration-300 hover:shadow-lg ${t.glow} group`}>
      <div className={`w-12 h-12 mb-4 ${t.iconColor} group-hover:scale-110 transition-transform duration-300`}>
        {IconComponent ? <IconComponent className="w-12 h-12" /> : <span className="text-4xl" aria-hidden="true">{icon}</span>}
      </div>
      <h3 className={`text-xl font-semibold ${t.text} mb-2 ${t.font}`}>{title}</h3>
      <p className={t.textMuted}>{description}</p>
    </div>
  )
}
