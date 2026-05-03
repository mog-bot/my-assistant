'use client'

import { useTheme, THEMES } from './theme-provider'

const THEME_ICONS = {
  'purple-dark': (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <circle cx="12" cy="12" r="8" />
    </svg>
  ),
  dark: (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9z" />
    </svg>
  ),
  light: (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
    </svg>
  ),
}

const THEME_COLORS = {
  'purple-dark': 'bg-purple-600 text-white',
  dark: 'bg-green-600 text-white',
  light: 'bg-gray-200 text-gray-800',
}

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const keys = Object.keys(THEMES)

  return (
    <div className="flex items-center gap-1 p-1 rounded-lg bg-white/10 backdrop-blur-sm border border-white/10" role="radiogroup" aria-label="Theme selection">
      {keys.map((key) => (
        <button
          key={key}
          role="radio"
          aria-checked={theme === key}
          aria-label={`${THEMES[key].label} theme`}
          onClick={() => setTheme(key)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 ${
            theme === key
              ? `${THEME_COLORS[key]} shadow-lg`
              : 'text-gray-400 hover:text-white'
          }`}
        >
          {THEME_ICONS[key]}
          <span className="hidden sm:inline">{THEMES[key].label}</span>
        </button>
      ))}
    </div>
  )
}
