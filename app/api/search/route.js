import { rateLimit } from '@/lib/rate-limit'

// CORS headers for cross-origin widget embeds
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders })
}

// Simple web search using DuckDuckGo HTML (no API key needed)
export async function POST(request) {
  const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
  const { allowed } = rateLimit(`search:${ip}`, 10, 60000)

  if (!allowed) {
    return Response.json(
      { error: 'Too many requests' },
      { status: 429, headers: corsHeaders }
    )
  }

  try {
    const { query } = await request.json()
    if (!query || typeof query !== 'string') {
      return Response.json({ error: 'Query required' }, { status: 400, headers: corsHeaders })
    }

    const searchQuery = query.slice(0, 200)
    const url = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(searchQuery)}`

    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 8000)

    let response
    try {
      response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; MyAssistantBot/1.0)',
        },
        signal: controller.signal,
      })
    } finally {
      clearTimeout(timeout)
    }

    if (!response.ok) {
      return Response.json({ results: [] }, { headers: corsHeaders })
    }

    const html = await response.text()

    // Parse results from DuckDuckGo HTML
    const results = []
    const resultRegex = /<a rel="nofollow" class="result__a"[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/g
    const snippetRegex = /<a class="result__snippet"[^>]*>([\s\S]*?)<\/a>/g

    let match
    while ((match = resultRegex.exec(html)) !== null && results.length < 5) {
      const title = match[2].replace(/<[^>]+>/g, '').trim()
      const href = match[1]
      results.push({ title, url: href, snippet: '' })
    }

    let i = 0
    while ((match = snippetRegex.exec(html)) !== null && i < results.length) {
      results[i].snippet = match[1].replace(/<[^>]+>/g, '').trim()
      i++
    }

    return Response.json({ results }, { headers: corsHeaders })
  } catch (error) {
    console.error('Search error:', error.message)
    return Response.json({ results: [] }, { headers: corsHeaders })
  }
}
