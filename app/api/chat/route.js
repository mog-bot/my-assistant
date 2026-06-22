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

// ─── Web search ────────────────────────────────────────────────────────────────
// Two sources run in parallel:
//   1. DDG Instant Answers API  — free JSON, no key, great for facts/definitions
//   2. DDG HTML scrape           — free, no key, gives real result snippets
// Both have their own timeout so a slow source never blocks the chat response.

async function ddgInstant(query) {
  try {
    const url = 'https://api.duckduckgo.com/?q=' + encodeURIComponent(query) +
      '&format=json&no_html=1&skip_disambig=1&t=my-assistant-widget'
    const ac = new AbortController()
    const t  = setTimeout(() => ac.abort(), 4000)
    const res = await fetch(url, { signal: ac.signal })
    clearTimeout(t)
    if (!res.ok) return ''
    const data = await res.json()
    const parts = []
    if (data.AbstractText)  parts.push(data.AbstractText)
    if (data.Answer)        parts.push(data.Answer)
    if (data.Definition)    parts.push(data.Definition)
    // Related topics give useful bullet-point facts
    if (Array.isArray(data.RelatedTopics)) {
      data.RelatedTopics.slice(0, 4).forEach(t => { if (t.Text) parts.push(t.Text) })
    }
    return parts.join('\n').trim()
  } catch { return '' }
}

async function ddgHtml(query) {
  try {
    const url = 'https://html.duckduckgo.com/html/?q=' + encodeURIComponent(query.slice(0, 200))
    const ac  = new AbortController()
    const t   = setTimeout(() => ac.abort(), 5000)
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' },
      signal: ac.signal,
    })
    clearTimeout(t)
    if (!res.ok) return ''
    const html = await res.text()
    const snippets = []
    const re = /<a class="result__snippet"[^>]*>([\s\S]*?)<\/a>/g
    let m
    while ((m = re.exec(html)) !== null && snippets.length < 5) {
      const text = m[1].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim()
      if (text) snippets.push(text)
    }
    return snippets.join('\n\n')
  } catch { return '' }
}

async function webSearch(query) {
  // Run both sources simultaneously — use whichever returns content first
  const [instant, html] = await Promise.all([ddgInstant(query), ddgHtml(query)])
  return [instant, html].filter(Boolean).join('\n\n').slice(0, 3000)
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
    const body        = await request.json()
    const message     = sanitizeInput(body.message, MAX_MESSAGE_LENGTH)
    const context     = sanitizeInput(body.context, MAX_CONTEXT_LENGTH)
    const enableSearch = body.enableSearch === true

    if (!message) {
      return Response.json({ error: 'Message is required' }, { status: 400, headers: corsHeaders })
    }

    // ── Step 1: kick off web search and first AI call IN PARALLEL ─────────────
    // The AI is asked to answer from business context if it can, or say NEEDS_SEARCH.
    // Meanwhile the web search runs so there's no extra wait if we do need results.

    const systemPrompt = context
      ? `You are a helpful AI assistant for a business. Answer customer questions based on the business information below. Be friendly, concise, and helpful (2–4 sentences max).
If the question cannot be answered from the business information, reply with exactly the word: NEEDS_SEARCH

Business Information:
${context}`
      : `You are a helpful AI assistant. Answer questions concisely and helpfully (2–4 sentences max).
If you genuinely don't know the answer, reply with exactly the word: NEEDS_SEARCH`

    const aiCallPromise = getGroq().chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user',   content: message },
      ],
      model: GROQ_MODEL,
      temperature: 0.3,
      max_tokens: 400,
    })

    // Only fire search fetch if search is enabled — still parallel with AI call
    const searchPromise = enableSearch ? webSearch(message) : Promise.resolve('')

    const [completion, searchResults] = await Promise.all([aiCallPromise, searchPromise])
    let reply = completion.choices[0]?.message?.content?.trim() || ''

    // ── Step 2: if AI couldn't answer, use pre-fetched web results ────────────
    let usedSearch = false
    if (enableSearch && reply === 'NEEDS_SEARCH') {
      if (searchResults) {
        usedSearch = true
        const searchPrompt = context
          ? `You are a helpful AI assistant for a business. A customer asked a question not covered by the business data, so you searched the web. Use the web results to give a helpful, accurate answer (2–4 sentences). If the web results aren't relevant either, say so honestly.

Business Information:
${context}

Web Search Results:
${searchResults}`
          : `You are a helpful AI assistant. Use the web search results below to answer the user's question accurately and concisely (2–4 sentences).

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
          "I searched the web but couldn't find a clear answer. You may want to contact the business directly."
      } else {
        reply = "I don't have that information and wasn't able to find it online right now. You may want to contact the business directly."
      }
    }

    // Clean up if LLM still returned NEEDS_SEARCH with search disabled
    if (reply === 'NEEDS_SEARCH') {
      reply = "I don't have that information, but you can contact the business directly for help."
    }

    // ── Unanswered detection ──────────────────────────────────────────────────
    const unansweredPhrases = [
      "I don't have that information",
      "contact the business directly",
      "I'm not sure about that",
      "I don't have enough information",
      "I cannot find",
      "not in the business information",
      "wasn't able to find",
    ]
    const isUnanswered = unansweredPhrases.some(p =>
      reply.toLowerCase().includes(p.toLowerCase())
    )

    const agentId      = body.agentId      || 'demo'
    const businessEmail = body.businessEmail || null
    const businessName  = body.businessName  || null
    logQuestion({ question: message, answer: reply, unanswered: isUnanswered, agentId, businessEmail, businessName, ip })

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
