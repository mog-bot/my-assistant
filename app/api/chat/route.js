import Groq from 'groq-sdk'
import { rateLimit } from '@/lib/rate-limit'
import { sanitizeInput } from '@/lib/validation'
import { GROQ_MODEL, MAX_MESSAGE_LENGTH, MAX_CONTEXT_LENGTH } from '@/lib/constants'

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

export async function POST(request) {
  // Rate limit by IP
  const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
  const { allowed } = rateLimit(ip, 20, 60000) // 20 requests per minute per IP

  if (!allowed) {
    return Response.json(
      { error: 'Too many requests. Please wait a moment.' },
      { status: 429, headers: { 'Retry-After': '60' } }
    )
  }

  try {
    const body = await request.json()
    const message = sanitizeInput(body.message, MAX_MESSAGE_LENGTH)
    const context = sanitizeInput(body.context, MAX_CONTEXT_LENGTH)

    if (!message) {
      return Response.json({ error: 'Message is required' }, { status: 400 })
    }

    const systemPrompt = context
      ? `You are a helpful AI assistant for a business. Answer customer questions based ONLY on the following business information. Be friendly, concise, and helpful. If the answer is not in the business information below, say "I don't have that information, but you can contact the business directly for help."\n\nBusiness Information:\n${context}`
      : `You are a helpful AI assistant. Answer questions concisely and helpfully.`

    const completion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message },
      ],
      model: GROQ_MODEL,
      temperature: 0.3, // Lower temp = less hallucination
      max_tokens: 500,
    })

    const reply = completion.choices[0]?.message?.content || 'Sorry, I could not generate a response.'

    return Response.json({ reply })
  } catch (error) {
    console.error('Chat API error:', error.message)

    if (error.status === 429) {
      return Response.json(
        { error: 'AI service is busy. Please try again in a moment.' },
        { status: 503 }
      )
    }

    return Response.json(
      { error: 'Failed to generate response. Please try again.' },
      { status: 500 }
    )
  }
}
