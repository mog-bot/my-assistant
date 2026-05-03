'use client'

import { useThemeStyles } from './theme-provider'
import { STEP_ICONS } from './icons'

export function StepCard({ number, title, description }) {
  const t = useThemeStyles()
  const IconComponent = STEP_ICONS[number]

  return (
    <div className="text-center group">
      <div className={`w-16 h-16 ${t.accentBg} rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg ${t.glowStrong} group-hover:scale-110 transition-transform duration-300`}>
        {IconComponent ? (
          <IconComponent className="w-8 h-8 text-white" />
        ) : (
          <span className="text-white font-bold text-xl">{number}</span>
        )}
      </div>
      <h3 className={`text-lg font-semibold ${t.text} mb-2 ${t.font}`}>{title}</h3>
      <p className={t.textMuted}>{description}</p>
    </div>
  )
}
