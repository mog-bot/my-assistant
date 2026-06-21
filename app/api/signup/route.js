import { supabase } from '@/lib/supabase'
import { rateLimit } from '@/lib/rate-limit'
import { sendWelcomeEmail } from '@/lib/email'

export async function POST(request) {
  const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
  const { allowed } = rateLimit(`signup:${ip}`, 5, 60000)

  if (!allowed) {
    return Response.json(
      { error: 'Too many requests. Please wait a moment.' },
      { status: 429, headers: { 'Retry-After': '60' } }
    )
  }

  try {
    const { email } = await request.json()

    if (!email || typeof email !== 'string') {
      return Response.json({ error: 'Email is required' }, { status: 400 })
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email) || email.length > 320) {
      return Response.json({ error: 'Invalid email address' }, { status: 400 })
    }

    const normalized = email.toLowerCase().trim()

    // If Supabase isn't configured, accept the signup gracefully (no DB write)
    if (!supabase) {
      console.warn('Supabase not configured — signup accepted without storage')
      sendWelcomeEmail(normalized).catch((err) => {
        console.error('Welcome email failed:', err.message)
      })
      return Response.json({ message: 'Signed up successfully' })
    }

    // Check for duplicate
    const { data: existing } = await supabase
      .from('signups')
      .select('id')
      .eq('email', normalized)
      .maybeSingle()

    if (existing) {
      return Response.json({ message: 'Already signed up' })
    }

    // Insert new signup
    const { error } = await supabase
      .from('signups')
      .insert({ email: normalized })

    if (error) {
      console.error('Supabase signup error:', error.message)
      return Response.json({ error: 'Failed to sign up' }, { status: 500 })
    }

    // Send welcome email (don't block response if it fails)
    sendWelcomeEmail(normalized).catch((err) => {
      console.error('Welcome email failed:', err.message)
    })

    return Response.json({ message: 'Signed up successfully' })
  } catch (error) {
    console.error('Signup error:', error.message)
    return Response.json({ error: 'Failed to sign up' }, { status: 500 })
  }
}
