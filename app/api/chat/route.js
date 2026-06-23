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

// ─── Search providers ──────────────────────────────────────────────────────────
// Priority: Serper (Google results) > Brave Search > Wikipedia fallback
// Add SERPER_API_KEY or BRAVE_API_KEY to .env.local to unlock real web search.
// Wikipedia is always available as a free fallback for factual questions.

async function searchSerper(query) {
  const key = process.env.SERPER_API_KEY
  if (!key) return ''
  try {
    const ac = new AbortController()
    const t  = setTimeout(() => ac.abort(), 6000)
    const res = await fetch('https://google.serper.dev/search', {
      method: 'POST',
      headers: { 'X-API-KEY': key, 'Content-Type': 'application/json' },
      body: JSON.stringify({ q: query, num: 5 }),
      signal: ac.signal,
    })
    clearTimeout(t)
    if (!res.ok) return ''
    const data = await res.json()
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
    const url = 'https://api.search.brave.com/res/v1/web/search?q=' +
      encodeURIComponent(query) + '&count=5&text_decorations=false'
    const res = await fetch(url, {
      headers: { 'Accept': 'application/json', 'X-Subscription-Token': key },
      signal: ac.signal,
    })
    clearTimeout(t)
    if (!res.ok) return ''
    const data = await res.json()
    const parts = []
    ;(data.web?.results || []).slice(0, 4).forEach(r => {
      if (r.description) parts.push(`${r.title}: ${r.description}`)
    })
    return parts.join('\n\n')
  } catch { return '' }
}

async function searchWikipedia(query) {
  // Always available — good for factual/encyclopedic questions
  try {
    const ac  = new AbortController()
    const t   = setTimeout(() => ac.abort(), 4000)
    const url = 'https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=' +
      encodeURIComponent(query) + '&format=json&srlimit=3&srprop=snippet'
    const res = await fetch(url, { signal: ac.signal })
    clearTimeout(t)
    if (!res.ok) return ''
    const data = await res.json()
    const results = (data.query?.search || [])
    if (!results.length) return ''
    return results
      .map(r => `${r.title}: ${r.snippet.replace(/<[^>]+>/g, '')}`)
      .join('\n\n')
  } catch { return '' }
}

async function webSearch(query) {
  // Try paid APIs first (if keys are set), fall back to Wikipedia
  const [serper, brave] = await Promise.all([searchSerper(query), searchBrave(query)])
  if (serper) return serper
  if (brave)  return brave
  // Wikipedia as last resort
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

    // Fire web search and first AI call IN PARALLEL so there's no extra wait
    // if search turns out to be needed.
    const systemPrompt = context
      ? `You are a helpful AI assistant for a business. Answer customer questions based on the business information below. Be friendly and concise (2–4 sentences).
If the question cannot be fully answered from the business information, reply with exactly: NEEDS_SEARCH

Business Information:
${context}`
      : `You are a helpful AI assistant. Answer questions concisely (2–4 sentences).
If you genuinely don't know the current or specific answer, reply with exactly: NEEDS_SEARCH`

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

    // If AI flagged it needs search, use the pre-fetched results
    if (enableSearch && reply === 'NEEDS_SEARCH') {
      if (searchResults) {
        usedSearch = true
        const searchPrompt = context
          ? `You are a helpful AI assistant for a business. Use the web search results below to answer the customer's question (2–4 sentences). Be honest that you found this via a web search.

Business Information:
${context}

Web Search Results:
${searchResults}`
          : `You are a helpful AI assistant. Use these web search results to answer the question accurately and concisely (2–4 sentences).

Web Search Results:
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
          "I searched but couldn't find a clear answer. Please contact the business directly."
      } else {
        reply = "I don't have that information and wasn't able to find it online. Please contact the business directly for help."
      }
    }

    if (reply === 'NEEDS_SEARCH') {
      reply = "I don't have that information, but the business team will be happy to help if you reach out directly."
    }

    const unansweredPhrases = [
      "I don't have that information",
      "contact the business directly",
      "I'm not sure about that",
      "I don't have enough information",
      "I cannot find",
      "wasn't able to find",
      "please reach out",
    ]
    const isUnanswered = unansweredPhrases.some(p =>
      reply.toLowerCase().includes(p.toLowerCase())
    )

    logQuestion({
      question: message,
      answer: reply,
      unanswered: isUnanswered,
      agentId:       body.agentId      || 'demo',
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
