import { rateLimit } from '@/lib/rate-limit'
import { getQuestions } from '@/lib/question-store'
import { sendWeeklyReport } from '@/lib/email'

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders })
}

// POST: Generate and send report email to business owner
export async function POST(request) {
  const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
  const { allowed } = rateLimit(`report:${ip}`, 5, 60000)

  if (!allowed) {
    return Response.json({ error: 'Rate limited' }, { status: 429, headers: corsHeaders })
  }

  try {
    const body = await request.json()
    const { businessEmail, businessName, agentId } = body

    if (!businessEmail || typeof businessEmail !== 'string') {
      return Response.json({ error: 'Business email is required' }, { status: 400, headers: corsHeaders })
    }

    // Get questions from the last 7 days for this agent
    const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
    const questions = await getQuestions({ agentId: agentId || 'demo', since })

    if (!questions || questions.length === 0) {
      return Response.json({ message: 'No questions to report', sent: false }, { headers: corsHeaders })
    }

    const unanswered = questions.filter((q) => q.unanswered)
    const answered = questions.filter((q) => !q.unanswered)

    // Send the email
    const result = await sendWeeklyReport({
      email: businessEmail,
      businessName,
      totalQuestions: questions.length,
      answered: answered.length,
      unanswered: unanswered.length,
      topUnanswered: unanswered,
    })

    return Response.json({
      sent: result.sent,
      to: businessEmail,
      summary: {
        total: questions.length,
        answered: answered.length,
        unanswered: unanswered.length,
      },
      error: result.error || null,
    }, { headers: corsHeaders })
  } catch (error) {
    console.error('Report API error:', error.message)
    return Response.json({ error: 'Failed to generate report' }, { status: 500, headers: corsHeaders })
  }
}
