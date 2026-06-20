import Groq from 'groq-sdk'
import { rateLimit } from '@/lib/rate-limit'
import { sanitizeInput } from '@/lib/validation'
import { GROQ_MODEL, MAX_MESSAGE_LENGTH, MAX_CONTEXT_LENGTH } from '@/lib/constants'
import { logQuestion } from '@/lib/question-store'

// CORS headers for cross-origin widget embeds
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

// Handle preflight
export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders })
}

// Lazy init — avoid crashing at build time when env vars aren't set
let groq
function getGroq() {
  if (!groq) {
    groq = new Groq({ apiKey: process.env.GROQ_API_KEY || process.env.groq_number_2 })
  }
  return groq
}

// Web search via DuckDuckGo HTML (no API key needed)
async function webSearch(query) {
  try {
    const url = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query.slice(0, 200))}`
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 6000)

    let response
    try {
      response = await fetch(url, {
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; MyAssistantBot/1.0)' },
        signal: controller.signal,
      })
    } finally {
      clearTimeout(timeout)
    }

    if (!response.ok) return ''

    const html = await response.text()

    // Extract snippets from DuckDuckGo HTML results
    const snippets = []
    const snippetRegex = /<a class="result__snippet"[^>]*>([\s\S]*?)<\/a>/g
    let match
    while ((match = snippetRegex.exec(html)) !== null && snippets.length < 4) {
      const text = match[1].replace(/<[^>]+>/g, '').trim()
      if (text) snippets.push(text)
    }

    return snippets.join('\n\n')
  } catch (e) {
    console.error('Web search failed:', e.message)
    return ''
  }
}

export async function POST(request) {
  // Rate limit by IP
  const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
  const { allowed } = rateLimit(ip, 20, 60000)

  if (!allowed) {
    return Response.json(
      { error: 'Too many requests. Please wait a moment.' },
      { status: 429, headers: { ...corsHeaders, 'Retry-After': '60' } }
    )
  }

  try {
    const body = await request.json()
    const message = sanitizeInput(body.message, MAX_MESSAGE_LENGTH)
    const context = sanitizeInput(body.context, MAX_CONTEXT_LENGTH)
    const enableSearch = body.enableSearch === true

    if (!message) {
      return Response.json({ error: 'Message is required' }, { status: 400, headers: corsHeaders })
    }

    const systemPrompt = context
      ? `You are a helpful AI assistant for a business. Answer customer questions based on the following business information. Be friendly, concise, and helpful. If the answer is not in the business information below, respond with exactly: "NEEDS_SEARCH" (and nothing else).\n\nBusiness Information:\n${context}`
      : `You are a helpful AI assistant. Answer questions concisely and helpfully. If you genuinely don't know the answer, respond with exactly: "NEEDS_SEARCH" (and nothing else).`

    let completion = await getGroq().chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message },
      ],
      model: GROQ_MODEL,
      temperature: 0.3,
      max_tokens: 500,
    })

    let reply = completion.choices[0]?.message?.content || ''

    // If the AI couldn't answer and search is enabled, try web search
    let usedSearch = false
    if (enableSearch && reply.trim() === 'NEEDS_SEARCH') {
      const searchResults = await webSearch(message)

      if (searchResults) {
        usedSearch = true
        const searchPrompt = context
          ? `You are a helpful AI assistant for a business. A customer asked a question that wasn't covered in your business data, so you searched the web for an answer. Use the web results below to give a helpful, concise answer. Always be honest that you found this information online.\n\nBusiness Information:\n${context}\n\nWeb Search Results:\n${searchResults}`
          : `You are a helpful AI assistant. Use the following web search results to answer the user's question concisely and helpfully.\n\nWeb Search Results:\n${searchResults}`

        completion = await getGroq().chat.completions.create({
          messages: [
            { role: 'system', content: searchPrompt },
            { role: 'user', content: message },
          ],
          model: GROQ_MODEL,
          temperature: 0.3,
          max_tokens: 500,
        })

        reply = completion.choices[0]?.message?.content || "I searched the web but couldn't find a clear answer. You may want to contact the business directly for help."
      } else {
        // Search failed, give a friendly fallback
        reply = "I don't have that information in my knowledge base, and I wasn't able to find it online either. You may want to contact the business directly for help with this question."
      }
    }

    // If reply is still NEEDS_SEARCH (search was disabled), give standard fallback
    if (reply.trim() === 'NEEDS_SEARCH') {
      reply = "I don't have that information, but you can contact the business directly for help."
    }

    // Detect if the bot couldn't answer (unanswered)
    const unansweredPhrases = [
      "I don't have that information",
      "contact the business directly",
      "I'm not sure about that",
      "I don't have enough information",
      "I cannot find",
      "not in the business information",
      "wasn't able to find",
    ]
    const isUnanswered = unansweredPhrases.some((phrase) =>
      reply.toLowerCase().includes(phrase.toLowerCase())
    )

    // Log the question asynchronously
    const agentId = body.agentId || 'demo'
    const businessEmail = body.businessEmail || null
    const businessName = body.businessName || null
    logQuestion({
      question: message,
      answer: reply,
      unanswered: isUnanswered,
      agentId,
      businessEmail,
      businessName,
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
