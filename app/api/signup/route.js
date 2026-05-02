import { promises as fs } from 'fs'
import path from 'path'

const SIGNUPS_FILE = path.join(process.cwd(), 'data', 'signups.json')

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

    // Store signup (file-based for now, swap for DB later)
    const dataDir = path.join(process.cwd(), 'data')
    await fs.mkdir(dataDir, { recursive: true })

    let signups = []
    try {
      const existing = await fs.readFile(SIGNUPS_FILE, 'utf-8')
      signups = JSON.parse(existing)
    } catch {
      // File doesn't exist yet, start fresh
    }

    // Check for duplicate
    if (signups.some((s) => s.email === email.toLowerCase())) {
      return Response.json({ message: 'Already signed up' })
    }

    signups.push({
      email: email.toLowerCase(),
      signedUpAt: new Date().toISOString(),
    })

    await fs.writeFile(SIGNUPS_FILE, JSON.stringify(signups, null, 2))

    return Response.json({ message: 'Signed up successfully' })
  } catch (error) {
    console.error('Signup error:', error.message)
    return Response.json({ error: 'Failed to sign up' }, { status: 500 })
  }
}
