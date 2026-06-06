import { rateLimit } from '@/lib/rate-limit'
import { getQuestions, clearQuestions } from '@/lib/question-store'

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders })
}

// POST: Send daily report email to business owner
// In production, use a proper email service (Resend, SendGrid, etc.)
// For now, this generates the report content and logs it
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

    // Get questions from the last 24 hours for this agent
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    const questions = getQuestions({ agentId: agentId || 'demo', since })

    if (!questions || questions.length === 0) {
      return Response.json({ message: 'No questions to report', sent: false }, { headers: corsHeaders })
    }

    const unanswered = questions.filter((q) => q.unanswered)
    const answered = questions.filter((q) => !q.unanswered)

    // Build email content
    const reportDate = new Date().toLocaleDateString('en-NZ', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })

    let emailBody = `Daily AI Assistant Report for ${businessName || 'Your Business'}\n`
    emailBody += `Date: ${reportDate}\n`
    emailBody += `═══════════════════════════════════════\n\n`
    emailBody += `Summary:\n`
    emailBody += `• Total questions received: ${questions.length}\n`
    emailBody += `• Successfully answered: ${answered.length}\n`
    emailBody += `• Could not answer: ${unanswered.length}\n\n`

    if (unanswered.length > 0) {
      emailBody += `── UNANSWERED QUESTIONS (Action Required) ──\n\n`
      emailBody += `These questions came in from customers but your AI agent didn't have enough information to answer them. Consider adding this info to your agent's knowledge base.\n\n`
      unanswered.forEach((q, i) => {
        emailBody += `${i + 1}. "${q.question}"\n`
        emailBody += `   Time: ${new Date(q.timestamp).toLocaleTimeString('en-NZ')}\n\n`
      })
    }

    if (answered.length > 0) {
      emailBody += `── ANSWERED QUESTIONS ──\n\n`
      answered.slice(0, 20).forEach((q, i) => {
        emailBody += `${i + 1}. "${q.question}"\n`
        emailBody += `   → ${q.answer.slice(0, 150)}${q.answer.length > 150 ? '...' : ''}\n\n`
      })
      if (answered.length > 20) {
        emailBody += `   ... and ${answered.length - 20} more answered questions\n\n`
      }
    }

    emailBody += `═══════════════════════════════════════\n`
    emailBody += `Powered by My Assistant — https://my-assistant-bhre.vercel.app\n`
    emailBody += `To improve your agent's answers, add more info at your dashboard.\n`

    // Log the report (in production, send via email API)
    console.log(`[REPORT] Sending daily report to: ${businessEmail}`)
    console.log(`[REPORT] ${unanswered.length} unanswered, ${answered.length} answered`)

    // TODO: Integrate with Resend/SendGrid to actually send emails
    // For now, return the report content so the frontend can use mailto: as fallback
    return Response.json({
      sent: true,
      to: businessEmail,
      subject: `Daily AI Report: ${unanswered.length} unanswered question${unanswered.length !== 1 ? 's' : ''} — ${reportDate}`,
      body: emailBody,
      summary: {
        total: questions.length,
        answered: answered.length,
        unanswered: unanswered.length,
      },
    }, { headers: corsHeaders })
  } catch (error) {
    console.error('Report API error:', error.message)
    return Response.json({ error: 'Failed to generate report' }, { status: 500, headers: corsHeaders })
  }
}
