'use client'

import { useThemeStyles } from './theme-provider'
import { ThemeToggle } from './theme-toggle'

const NAV_LINKS = [
  { href: '#features', label: 'Features' },
  { href: '#how-it-works', label: 'How It Works' },
  { href: '#pricing', label: 'Pricing' },
]

export function Navbar() {
  const t = useThemeStyles()

  return (
    <nav
      aria-label="Main navigation"
      className={`flex items-center justify-between px-8 py-6 max-w-7xl mx-auto border-b ${t.navBorder}`}
    >
      <div className={`text-2xl font-bold ${t.text} ${t.font}`}>
        <span className={t.accent}>&gt;_</span> My Assistant
      </div>
      <div className="flex items-center gap-6">
        <div className="hidden md:flex gap-6">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className={`${t.textMuted} hover:${t.accent} transition-colors text-sm`}
            >
              {link.label}
            </a>
          ))}
        </div>
        <ThemeToggle />
      </div>
    </nav>
  )
}
