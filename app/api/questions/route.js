import { rateLimit } from '@/lib/rate-limit'
import { getQuestions } from '@/lib/question-store'

// CORS headers for cross-origin widget embeds
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders })
}

// GET: Retrieve logged questions (for report generation)
export async function GET(request) {
  const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
  const { allowed } = rateLimit(`qget:${ip}`, 30, 60000)

  if (!allowed) {
    return Response.json({ error: 'Rate limited' }, { status: 429, headers: corsHeaders })
  }

  const { searchParams } = new URL(request.url)
  const agentId = searchParams.get('agentId')
  const unansweredOnly = searchParams.get('unanswered') === 'true'
  const since = searchParams.get('since') // ISO timestamp

  const questions = getQuestions({ agentId, unansweredOnly, since })

  return Response.json({ questions, total: questions.length }, { headers: corsHeaders })
}
