import * as cheerio from 'cheerio'
import { rateLimit } from '@/lib/rate-limit'
import { validateUrl } from '@/lib/validation'
import { MAX_SCRAPE_CONTENT_LENGTH, MAX_SCRAPE_LINKS } from '@/lib/constants'

const FETCH_TIMEOUT_MS = 10000

export async function POST(request) {
  // Rate limit — scraping is expensive, 5 per minute per IP
  const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
  const { allowed } = rateLimit(`scrape:${ip}`, 5, 60000)

  if (!allowed) {
    return Response.json(
      { error: 'Too many requests. Please wait a moment.' },
      { status: 429, headers: { 'Retry-After': '60' } }
    )
  }

  try {
    const body = await request.json()
    const { url } = body

    if (!url) {
      return Response.json({ error: 'URL is required' }, { status: 400 })
    }

    // Validate URL (SSRF protection)
    const validation = validateUrl(url)
    if (!validation.valid) {
      return Response.json({ error: validation.error }, { status: 400 })
    }

    // Fetch with timeout
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS)

    let response
    try {
      response = await fetch(validation.url, {
        headers: {
          'User-Agent': 'MyAssistant-Bot/1.0 (Business AI Training)',
          'Accept': 'text/html',
        },
        signal: controller.signal,
      })
    } finally {
      clearTimeout(timeout)
    }

    if (!response.ok) {
      return Response.json(
        { error: `Could not access that website (status ${response.status})` },
        { status: 400 }
      )
    }

    // Verify content type is HTML
    const contentType = response.headers.get('content-type') || ''
    if (!contentType.includes('text/html') && !contentType.includes('text/plain')) {
      return Response.json(
        { error: 'URL does not point to a web page' },
        { status: 400 }
      )
    }

    const html = await response.text()
    const $ = cheerio.load(html)

    // Remove non-content elements
    $('script, style, nav, footer, header, iframe, noscript, svg, form').remove()

    const title = $('title').text().trim()
    const metaDescription = $('meta[name="description"]').attr('content') || ''

    // Extract structured content
    const bodyText = $('body')
      .text()
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, MAX_SCRAPE_CONTENT_LENGTH)

    // Extract internal links for potential deep scraping
    const links = new Set()
    $('a[href]').each((_, el) => {
      const href = $(el).attr('href')
      if (href && href.startsWith('/') && !href.includes('#') && links.size < MAX_SCRAPE_LINKS) {
        links.add(href)
      }
    })

    return Response.json({
      title,
      description: metaDescription,
      content: bodyText,
      internalLinks: [...links],
      scrapedAt: new Date().toISOString(),
    })
  } catch (error) {
    if (error.name === 'AbortError') {
      return Response.json(
        { error: 'Website took too long to respond' },
        { status: 408 }
      )
    }

    console.error('Scrape API error:', error.message)
    return Response.json(
      { error: 'Failed to scrape website. Please check the URL and try again.' },
      { status: 500 }
    )
  }
}
