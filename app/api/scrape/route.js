import * as cheerio from 'cheerio'
import { rateLimit } from '@/lib/rate-limit'
import { validateUrl } from '@/lib/validation'
import { MAX_SCRAPE_CONTENT_LENGTH, MAX_SCRAPE_LINKS } from '@/lib/constants'

const FETCH_TIMEOUT_MS = 10000

// ─── Platform detection ────────────────────────────────────────────────────────
function detectPlatform(url, html) {
  // URL-based (most reliable — custom domains still get detected)
  if (/wixsite\.com|\.wix\.com/i.test(url))           return 'wix'
  if (/squarespace\.com/i.test(url))                   return 'squarespace'
  if (/myshopify\.com/i.test(url))                     return 'shopify'
  if (/webflow\.io/i.test(url))                        return 'webflow'
  if (/framer\.app|framercdn\.com/i.test(url))         return 'framer'
  if (/wordpress\.com/i.test(url))                     return 'wordpress'

  // HTML fingerprints (for sites on custom domains)
  if (/wix-code|wixstatic\.com|wixmp\.com/i.test(html))                         return 'wix'
  if (/static1?\.squarespace\.com|squarespace-cdn\.com/i.test(html))            return 'squarespace'
  if (/cdn\.shopify\.com|Shopify\.theme|myshopify/i.test(html))                 return 'shopify'
  if (/wp-content|wp-includes|wordpress/i.test(html))                           return 'wordpress'
  if (/data-wf-page|webflow\.com|\.webflow\./i.test(html))                      return 'webflow'
  if (/framerusercontent\.com|framer\.com\/m\//i.test(html))                    return 'framer'

  // Meta generator tag
  const generatorMatch = html.match(/<meta[^>]+name=["']generator["'][^>]+content=["']([^"']+)/i)
    || html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+name=["']generator["']/i)
  if (generatorMatch) {
    const gen = generatorMatch[1].toLowerCase()
    if (gen.includes('wix'))          return 'wix'
    if (gen.includes('squarespace'))  return 'squarespace'
    if (gen.includes('shopify'))      return 'shopify'
    if (gen.includes('wordpress'))    return 'wordpress'
    if (gen.includes('webflow'))      return 'webflow'
  }

  return null
}

export async function POST(request) {
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

    const validation = validateUrl(url)
    if (!validation.valid) {
      return Response.json({ error: validation.error }, { status: 400 })
    }

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

    const contentType = response.headers.get('content-type') || ''
    if (!contentType.includes('text/html') && !contentType.includes('text/plain')) {
      return Response.json(
        { error: 'URL does not point to a web page' },
        { status: 400 }
      )
    }

    const html = await response.text()

    // Detect platform BEFORE cheerio strips scripts/meta
    const platform = detectPlatform(validation.url, html)

    const $ = cheerio.load(html)
    $('script, style, nav, footer, header, iframe, noscript, svg, form').remove()

    const title = $('title').text().trim()
    const metaDescription = $('meta[name="description"]').attr('content') || ''

    const bodyText = $('body')
      .text()
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, MAX_SCRAPE_CONTENT_LENGTH)

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
      platform,
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
