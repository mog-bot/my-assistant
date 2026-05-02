// In-memory signup store for demo/draft
// In production, replace with a database (Supabase, Planetscale, etc.)
const signups = []

export async function POST(request) {
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

    // Check for duplicate (in-memory only — resets on redeploy)
    if (signups.some((s) => s.email === normalized)) {
      return Response.json({ message: 'Already signed up' })
    }

    signups.push({
      email: normalized,
      signedUpAt: new Date().toISOString(),
    })

    console.log(`New signup: ${normalized} (total: ${signups.length})`)

    return Response.json({ message: 'Signed up successfully' })
  } catch (error) {
    console.error('Signup error:', error.message)
    return Response.json({ error: 'Failed to sign up' }, { status: 500 })
  }
}
