import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Only create the client if BOTH credentials are present and look valid.
// Passing empty strings to createClient throws "supabaseUrl is required" and
// crashes the Vercel build. Returning null lets the app run without Supabase.
let supabase = null

if (supabaseUrl && supabaseAnonKey && supabaseUrl.startsWith('http')) {
  try {
    supabase = createClient(supabaseUrl, supabaseAnonKey)
  } catch (err) {
    console.warn('Supabase client init failed:', err.message)
    supabase = null
  }
} else {
  console.warn('Supabase credentials not set — falling back to in-memory logging')
}

export { supabase }
