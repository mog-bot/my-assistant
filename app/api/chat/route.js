import Groq from 'groq-sdk'
import { rateLimit } from '@/lib/rate-limit'
import { sanitizeInput } from '@/lib/validation'
import { GROQ_MODEL, MAX_MESSAGE_LENGTH, MAX_CONTEXT_LENGTH } from '@/lib/constants'
import { logQuestion } from '@/lib/question-store'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders })
}

let groq
function getGroq() {
  if (!groq) groq = new Groq({ apiKey: process.env.GROQ_API_KEY || process.env.groq_number_2 })
  return groq
}

const WIKI_UA = 'MyAssistantWidget/1.0 (https://my-assistant-bhre.vercel.app)'

// ─── Wikipedia search ──────────────────────────────────────────────────────────
// Two-step: full-text search → fetch article extracts for the top results.
// Free, no API key needed, works reliably from server-side.
async function searchWikipedia(query) {
  try {
    // Step 1 — find matching articles
    const searchAc = new AbortController()
    const searchT  = setTimeout(() => searchAc.abort(), 4000)
    const searchRes = await fetch(
      'https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=' +
        encodeURIComponent(query) +
        '&format=json&srlimit=3&srprop=snippet',
      { headers: { 'User-Agent': WIKI_UA }, signal: searchAc.signal }
    )
    clearTimeout(searchT)
    if (!searchRes.ok) return ''

    const searchData = await searchRes.json()
    const results    = searchData.query?.search || []
    if (!results.length) return ''

    // Step 2 — fetch the intro extract for the top 2 articles
    const titles   = results.slice(0, 2).map(r => r.title).join('|')
    const extractAc = new AbortController()
    const extractT  = setTimeout(() => extractAc.abort(), 4000)
    const extractRes = await fetch(
      'https://en.wikipedia.org/w/api.php?action=query&prop=extracts' +
        '&exintro=1&explaintext=1&redirects=1&exchars=800' +
        '&titles=' + encodeURIComponent(titles) + '&format=json',
      { headers: { 'User-Agent': WIKI_UA }, signal: extractAc.signal }
    )
    clearTimeout(extractT)
    if (!extractRes.ok) return ''

    const extractData = await extractRes.json()
    const pages       = Object.values(extractData.query?.pages || {})
    const parts       = pages
      .filter(p => p.extract && p.extract.length > 50)
      .map(p => `${p.title}: ${p.extract.trim()}`)

    return parts.join('\n\n').slice(0, 2500)
  } catch {
    return ''
  }
}

// ─── Optional paid search (plug in a key to upgrade) ──────────────────────────
async function searchSerper(query) {
  const key = process.env.SERPER_API_KEY
  if (!key) return ''
  try {
    const ac  = new AbortController()
    const t   = setTimeout(() => ac.abort(), 6000)
    const res = await fetch('https://google.serper.dev/search', {
      method: 'POST',
      headers: { 'X-API-KEY': key, 'Content-Type': 'application/json' },
      body: JSON.stringify({ q: query, num: 5 }),
      signal: ac.signal,
    })
    clearTimeout(t)
    if (!res.ok) return ''
    const data  = await res.json()
    const parts = []
    if (data.answerBox?.answer)  parts.push(data.answerBox.answer)
    if (data.answerBox?.snippet) parts.push(data.answerBox.snippet)
    ;(data.organic || []).slice(0, 4).forEach(r => {
      if (r.snippet) parts.push(`${r.title}: ${r.snippet}`)
    })
    return parts.join('\n\n')
  } catch { return '' }
}

async function searchBrave(query) {
  const key = process.env.BRAVE_API_KEY
  if (!key) return ''
  try {
    const ac  = new AbortController()
    const t   = setTimeout(() => ac.abort(), 6000)
    const res = await fetch(
      'https://api.search.brave.com/res/v1/web/search?q=' +
        encodeURIComponent(query) + '&count=5&text_decorations=false',
      {
        headers: { Accept: 'application/json', 'X-Subscription-Token': key },
        signal: ac.signal,
      }
    )
    clearTimeout(t)
    if (!res.ok) return ''
    const data = await res.json()
    return (data.web?.results || [])
      .slice(0, 4)
      .filter(r => r.description)
      .map(r => `${r.title}: ${r.description}`)
      .join('\n\n')
  } catch { return '' }
}

// Master search — tries paid APIs first (if keys set), falls back to Wikipedia
async function webSearch(query) {
  const [serper, brave] = await Promise.all([searchSerper(query), searchBrave(query)])
  if (serper) return serper
  if (brave)  return brave
  return searchWikipedia(query)
}

// ─── Chat handler ──────────────────────────────────────────────────────────────
export async function POST(request) {
  const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
  const { allowed } = rateLimit(ip, 20, 60000)
  if (!allowed) {
    return Response.json(
      { error: 'Too many requests. Please wait a moment.' },
      { status: 429, headers: { ...corsHeaders, 'Retry-After': '60' } }
    )
  }

  try {
    const body         = await request.json()
    const message      = sanitizeInput(body.message, MAX_MESSAGE_LENGTH)
    const context      = sanitizeInput(body.context, MAX_CONTEXT_LENGTH)
    const enableSearch = body.enableSearch === true

    if (!message) {
      return Response.json({ error: 'Message is required' }, { status: 400, headers: corsHeaders })
    }

    // Fire AI call and web search IN PARALLEL — no extra latency when search is needed
    const businessName = body.businessName || 'this business'
    const systemPrompt = context
      ? `You are the AI assistant for ${businessName}. You speak as a representative of ${businessName} — use "we", "our", "us". Never say "based on the business information", "according to the website", or "the business". Just answer directly and naturally as a team member would.
Be friendly and concise (2–4 sentences).
If you genuinely cannot answer from the information provided, reply with exactly: NEEDS_SEARCH

Our information:
${context}`
      : `You are a helpful AI assistant. Answer questions concisely and naturally (2–4 sentences).
If you don't know or the answer requires current or specific information you don't have, reply with exactly: NEEDS_SEARCH`

    const [completion, searchResults] = await Promise.all([
      getGroq().chat.completions.create({
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user',   content: message },
        ],
        model: GROQ_MODEL,
        temperature: 0.3,
        max_tokens: 400,
      }),
      enableSearch ? webSearch(message) : Promise.resolve(''),
    ])

    let reply      = completion.choices[0]?.message?.content?.trim() || ''
    let usedSearch = false

    // If AI couldn't answer from business context, use pre-fetched search results
    if (enableSearch && reply === 'NEEDS_SEARCH') {
      if (searchResults) {
        usedSearch = true
        const searchPrompt = context
          ? `You are the AI assistant for ${businessName}. Speak as "we"/"our" — never refer to "the website" or "the business information". You looked up additional information to answer this question. Use everything below to give a helpful, accurate answer (2–4 sentences).

Our information:
${context}

Additional search results:
${searchResults}`
          : `You are a helpful AI assistant. Use these search results to answer the question accurately and concisely (2–4 sentences).

Search results:
${searchResults}`

        const fallback = await getGroq().chat.completions.create({
          messages: [
            { role: 'system', content: searchPrompt },
            { role: 'user',   content: message },
          ],
          model: GROQ_MODEL,
          temperature: 0.3,
          max_tokens: 400,
        })
        reply = fallback.choices[0]?.message?.content?.trim() ||
          "We weren't able to find a clear answer to that. Feel free to get in touch with us directly and we'll be happy to help!"
      } else {
        reply = "We don't have that information to hand right now. Please reach out to us directly and we'll get you sorted!"
      }
    }

    if (reply === 'NEEDS_SEARCH') {
      reply = "We're not sure about that one — please reach out to us directly and we'll be happy to help!"
    }

    const unansweredPhrases = [
      "I don't have that information",
      "contact the business directly",
      "wasn't able to find",
      "please reach out",
    ]
    const isUnanswered = unansweredPhrases.some(p =>
      reply.toLowerCase().includes(p.toLowerCase())
    )

    logQuestion({
      question:      message,
      answer:        reply,
      unanswered:    isUnanswered,
      agentId:       body.agentId       || 'demo',
      businessEmail: body.businessEmail || null,
      businessName:  body.businessName  || null,
      ip,
    })

    return Response.json({ reply, unanswered: isUnanswered, searched: usedSearch }, { headers: corsHeaders })
  } catch (error) {
    console.error('Chat API error:', error.message)
    if (error.status === 429) {
      return Response.json(
        { error: 'AI service is busy. Please try again in a moment.' },
        { status: 503, headers: corsHeaders }
      )
    }
    return Response.json(
      { error: 'Failed to generate response. Please try again.' },
      { status: 500, headers: corsHeaders }
    )
  }
}
