'use client'

import { useState, useCallback } from 'react'
import { useThemeStyles } from './theme-provider'

export function EmailSignupForm() {
  const [email, setEmail] = useState('')
  const [formState, setFormState] = useState('idle')
  const [errorMessage, setErrorMessage] = useState('')
  const t = useThemeStyles()

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault()
      const trimmed = email.trim().toLowerCase()
      if (!trimmed) return

      setFormState('submitting')
      setErrorMessage('')

      try {
        const res = await fetch('/api/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: trimmed }),
        })

        if (!res.ok) {
          const data = await res.json().catch(() => ({}))
          throw new Error(data.error || 'Something went wrong. Please try again.')
        }

        setFormState('success')
      } catch (err) {
        setFormState('error')
        setErrorMessage(
          err instanceof Error ? err.message : 'Something went wrong. Please try again.'
        )
      }
    },
    [email]
  )

  if (formState === 'success') {
    return (
      <div
        role="status"
        aria-live="polite"
        className={`${t.accentBg}/20 border ${t.accentBorder} rounded-lg p-6 max-w-md mx-auto`}
      >
        <p className={`${t.accent} text-lg`}>
          You&apos;re on the list! We&apos;ll be in touch soon.
        </p>
      </div>
    )
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-4 max-w-md mx-auto"
      noValidate
    >
      <div className="flex flex-col sm:flex-row gap-4">
        <label htmlFor="signup-email" className="sr-only">
          Email address
        </label>
        <input
          id="signup-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          maxLength={320}
          required
          aria-required="true"
          aria-invalid={formState === 'error' ? 'true' : undefined}
          aria-describedby={formState === 'error' ? 'signup-error' : undefined}
          disabled={formState === 'submitting'}
          className={`px-6 py-4 rounded-lg ${t.inputBg} border ${t.inputBorder} ${t.text} placeholder-gray-400 flex-1 focus:outline-none ${t.inputFocus} disabled:opacity-50 ${t.font}`}
        />
        <button
          type="submit"
          disabled={formState === 'submitting'}
          className={`px-8 py-4 ${t.accentBg} ${t.accentHover} text-white font-semibold rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg ${t.glow}`}
        >
          {formState === 'submitting' ? 'Joining...' : 'Get Started Free'}
        </button>
      </div>
      {formState === 'error' && (
        <p id="signup-error" role="alert" className="text-red-400 text-sm">
          {errorMessage}
        </p>
      )}
    </form>
  )
}
