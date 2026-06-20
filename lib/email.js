import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

// On the free plan, you can only send from onboarding@resend.dev
// Once you add a custom domain in Resend, update this
const FROM_EMAIL = 'My Assistant <onboarding@resend.dev>'

export async function sendWelcomeEmail(email) {
  try {
    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: 'Welcome to My Assistant 🎉',
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
          <h1 style="color: #7c3aed; margin-bottom: 24px;">Welcome to My Assistant</h1>
          <p style="font-size: 16px; line-height: 1.6; color: #374151;">
            You're in! Here's how to get your AI agent live in under 5 minutes:
          </p>
          <ol style="font-size: 16px; line-height: 2; color: #374151;">
            <li><strong>Go to your dashboard</strong> and paste your website URL</li>
            <li><strong>Test your agent</strong> — ask it questions about your business</li>
            <li><strong>Copy the embed code</strong> and paste it on your site</li>
          </ol>
          <div style="margin-top: 32px;">
            <a href="https://my-assistant-bhre.vercel.app/dashboard" 
               style="background: #7c3aed; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600;">
              Go to Dashboard →
            </a>
          </div>
          <p style="font-size: 14px; color: #9ca3af; margin-top: 40px;">
            Questions? Just reply to this email.
          </p>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin-top: 32px;" />
          <p style="font-size: 12px; color: #9ca3af;">
            My Assistant — AI agents trained on your business data
          </p>
        </div>
      `,
    })

    if (error) {
      console.error('Welcome email error:', error.message)
      return { sent: false, error: error.message }
    }

    return { sent: true }
  } catch (err) {
    console.error('Welcome email exception:', err.message)
    return { sent: false, error: err.message }
  }
}

export async function sendWeeklyReport({ email, businessName, totalQuestions, answered, unanswered, topUnanswered }) {
  try {
    const unansweredList = (topUnanswered || [])
      .slice(0, 5)
      .map((q) => `<li style="margin-bottom: 8px;">"${q.question}"</li>`)
      .join('')

    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: `Weekly Report: ${totalQuestions} questions this week${unanswered > 0 ? ` (${unanswered} need attention)` : ''}`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
          <h1 style="color: #7c3aed; margin-bottom: 8px;">Weekly AI Agent Report</h1>
          <p style="color: #6b7280; margin-bottom: 32px;">${businessName || 'Your Business'}</p>
          
          <div style="display: flex; gap: 16px; margin-bottom: 32px;">
            <div style="background: #f3f4f6; border-radius: 12px; padding: 20px; flex: 1; text-align: center;">
              <div style="font-size: 32px; font-weight: 700; color: #111827;">${totalQuestions}</div>
              <div style="font-size: 14px; color: #6b7280;">Total Questions</div>
            </div>
            <div style="background: #ecfdf5; border-radius: 12px; padding: 20px; flex: 1; text-align: center;">
              <div style="font-size: 32px; font-weight: 700; color: #059669;">${answered}</div>
              <div style="font-size: 14px; color: #6b7280;">Answered</div>
            </div>
            <div style="background: #fef2f2; border-radius: 12px; padding: 20px; flex: 1; text-align: center;">
              <div style="font-size: 32px; font-weight: 700; color: #dc2626;">${unanswered}</div>
              <div style="font-size: 14px; color: #6b7280;">Unanswered</div>
            </div>
          </div>

          ${unanswered > 0 ? `
            <h2 style="font-size: 18px; color: #111827; margin-bottom: 12px;">❓ Questions Your Agent Couldn't Answer</h2>
            <p style="font-size: 14px; color: #6b7280; margin-bottom: 16px;">Add this info to your agent's knowledge base to improve responses:</p>
            <ul style="font-size: 15px; color: #374151; line-height: 1.8;">
              ${unansweredList}
            </ul>
          ` : '<p style="color: #059669; font-weight: 600;">✅ Your agent answered every question this week!</p>'}

          <div style="margin-top: 32px;">
            <a href="https://my-assistant-bhre.vercel.app/dashboard" 
               style="background: #7c3aed; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600;">
              View Dashboard →
            </a>
          </div>

          <hr style="border: none; border-top: 1px solid #e5e7eb; margin-top: 40px;" />
          <p style="font-size: 12px; color: #9ca3af;">
            My Assistant — AI agents trained on your business data
          </p>
        </div>
      `,
    })

    if (error) {
      console.error('Weekly report email error:', error.message)
      return { sent: false, error: error.message }
    }

    return { sent: true }
  } catch (err) {
    console.error('Weekly report email exception:', err.message)
    return { sent: false, error: err.message }
  }
}
