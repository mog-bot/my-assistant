'use client'

import { createContext, useContext, useState, useEffect, useCallback } from 'react'

const ThemeContext = createContext({ theme: 'purple-dark', setTheme: () => {} })

export const THEMES = {
  'purple-dark': {
    label: 'Purple',
    bg: 'bg-[#0a0a0f]',
    bgGradient: 'bg-gradient-to-br from-[#0a0a0f] via-[#1a0a2e] to-[#0a0a0f]',
    accent: 'text-purple-400',
    accentBg: 'bg-purple-600',
    accentHover: 'hover:bg-purple-500',
    accentBorder: 'border-purple-500',
    glow: 'shadow-purple-500/20',
    glowStrong: 'shadow-purple-500/40',
    text: 'text-white',
    textMuted: 'text-gray-400',
    textSubtle: 'text-gray-500',
    cardBg: 'bg-white/5',
    cardBorder: 'border-white/10',
    cardHover: 'hover:bg-white/10',
    inputBg: 'bg-white/10',
    inputBorder: 'border-white/20',
    inputFocus: 'focus:border-purple-400',
    navBorder: 'border-white/10',
    iconColor: 'text-purple-400',
    checkColor: 'text-purple-400',
    highlightBg: 'bg-purple-600',
    highlightBorder: 'border-purple-400',
    codeBg: 'bg-black/50',
    codeText: 'text-purple-300',
    font: 'font-sans',
  },
  dark: {
    label: 'Matrix',
    bg: 'bg-[#0a0a0a]',
    bgGradient: 'bg-gradient-to-br from-[#0a0a0a] via-[#0a1a0a] to-[#0a0a0a]',
    accent: 'text-green-400',
    accentBg: 'bg-green-600',
    accentHover: 'hover:bg-green-500',
    accentBorder: 'border-green-500',
    glow: 'shadow-green-500/20',
    glowStrong: 'shadow-green-500/40',
    text: 'text-green-100',
    textMuted: 'text-green-300/70',
    textSubtle: 'text-green-400/50',
    cardBg: 'bg-green-950/30',
    cardBorder: 'border-green-500/20',
    cardHover: 'hover:bg-green-950/50',
    inputBg: 'bg-green-950/30',
    inputBorder: 'border-green-500/30',
    inputFocus: 'focus:border-green-400',
    navBorder: 'border-green-500/20',
    iconColor: 'text-green-400',
    checkColor: 'text-green-400',
    highlightBg: 'bg-green-600',
    highlightBorder: 'border-green-400',
    codeBg: 'bg-black/70',
    codeText: 'text-green-400',
    font: 'font-mono',
  },
  light: {
    label: 'Light',
    bg: 'bg-gray-50',
    bgGradient: 'bg-gradient-to-br from-gray-50 via-purple-50 to-gray-50',
    accent: 'text-purple-600',
    accentBg: 'bg-purple-600',
    accentHover: 'hover:bg-purple-500',
    accentBorder: 'border-purple-500',
    glow: 'shadow-purple-500/10',
    glowStrong: 'shadow-purple-500/20',
    text: 'text-gray-900',
    textMuted: 'text-gray-600',
    textSubtle: 'text-gray-400',
    cardBg: 'bg-white',
    cardBorder: 'border-gray-200',
    cardHover: 'hover:bg-gray-50',
    inputBg: 'bg-white',
    inputBorder: 'border-gray-300',
    inputFocus: 'focus:border-purple-500',
    navBorder: 'border-gray-200',
    iconColor: 'text-purple-600',
    checkColor: 'text-purple-600',
    highlightBg: 'bg-purple-600',
    highlightBorder: 'border-purple-400',
    codeBg: 'bg-gray-100',
    codeText: 'text-purple-700',
    font: 'font-sans',
  },
}

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState('purple-dark')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('ma-theme')
    if (saved && THEMES[saved]) {
      setThemeState(saved)
    }
    setMounted(true)
  }, [])

  const setTheme = useCallback((t) => {
    setThemeState(t)
    localStorage.setItem('ma-theme', t)
  }, [])

  if (!mounted) {
    return <div className="bg-[#0a0a0f] min-h-screen" />
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  return useContext(ThemeContext)
}

export function useThemeStyles() {
  const { theme } = useTheme()
  return THEMES[theme] || THEMES['purple-dark']
}
