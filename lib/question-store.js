import { supabase } from '@/lib/supabase'
import { rateLimit } from '@/lib/rate-limit'

// Shared in-memory fallback (used if Supabase is unavailable)
const questionLogs = []

export async function logQuestion({ question, answer, unanswered, agentId, businessEmail, businessName, ip }) {
  const record = {
    question: (question || '').slice(0, 2000),
    answer: (answer || '').slice(0, 2000),
    unanswered: Boolean(unanswered),
    agent_id: agentId || 'demo',
    business_email: businessEmail || null,
    business_name: businessName || null,
    ip: ip || 'unknown',
  }

  // Try Supabase first
  const { error } = await supabase.from('chat_logs').insert(record)

  if (error) {
    console.error('Supabase chat_logs insert error:', error.message)
    // Fallback to in-memory
    questionLogs.push({ ...record, timestamp: new Date().toISOString() })
    if (questionLogs.length > 10000) {
      questionLogs.splice(0, questionLogs.length - 10000)
    }
  }
}

export async function getQuestions({ agentId, unansweredOnly, since } = {}) {
  let query = supabase
    .from('chat_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(500)

  if (agentId) {
    query = query.eq('agent_id', agentId)
  }

  if (unansweredOnly) {
    query = query.eq('unanswered', true)
  }

  if (since) {
    query = query.gte('created_at', since)
  }

  const { data, error } = await query

  if (error) {
    console.error('Supabase chat_logs query error:', error.message)
    // Fallback to in-memory
    let filtered = questionLogs
    if (agentId) filtered = filtered.filter((q) => q.agent_id === agentId)
    if (unansweredOnly) filtered = filtered.filter((q) => q.unanswered)
    if (since) filtered = filtered.filter((q) => q.timestamp >= since)
    return filtered
  }

  return data || []
}

export async function clearQuestions({ agentId, before } = {}) {
  const cutoff = before || new Date().toISOString()

  let query = supabase
    .from('chat_logs')
    .delete()
    .lte('created_at', cutoff)

  if (agentId) {
    query = query.eq('agent_id', agentId)
  }

  const { error } = await query

  if (error) {
    console.error('Supabase chat_logs delete error:', error.message)
  }
}
