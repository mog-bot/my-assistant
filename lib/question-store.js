// lib/question-store.js
// Shared in-memory question log (persists per serverless instance lifecycle)
// In production, replace with a database (Supabase, Planetscale, etc.)

const questionLogs = []

export function logQuestion({ question, answer, unanswered, agentId, businessEmail, businessName, ip }) {
  questionLogs.push({
    question: (question || '').slice(0, 2000),
    answer: (answer || '').slice(0, 2000),
    unanswered: Boolean(unanswered),
    agentId: agentId || 'demo',
    businessEmail: businessEmail || null,
    businessName: businessName || null,
    timestamp: new Date().toISOString(),
    ip: ip || 'unknown',
  })

  // Keep max 10000 entries to avoid memory issues
  if (questionLogs.length > 10000) {
    questionLogs.splice(0, questionLogs.length - 10000)
  }
}

export function getQuestions({ agentId, unansweredOnly, since } = {}) {
  let filtered = questionLogs

  if (agentId) {
    filtered = filtered.filter((q) => q.agentId === agentId)
  }

  if (unansweredOnly) {
    filtered = filtered.filter((q) => q.unanswered)
  }

  if (since) {
    filtered = filtered.filter((q) => q.timestamp >= since)
  }

  return filtered
}

export function clearQuestions({ agentId, before } = {}) {
  const cutoff = before || new Date().toISOString()
  for (let i = questionLogs.length - 1; i >= 0; i--) {
    if ((!agentId || questionLogs[i].agentId === agentId) && questionLogs[i].timestamp <= cutoff) {
      questionLogs.splice(i, 1)
    }
  }
}
