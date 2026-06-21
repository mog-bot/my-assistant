import { supabase } from '@/lib/supabase'

// Shared in-memory fallback (used if Supabase is unavailable or not configured)
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

  // If Supabase isn't configured, log in-memory and return
  if (!supabase) {
    questionLogs.push({ ...record, timestamp: new Date().toISOString() })
    if (questionLogs.length > 10000) {
      questionLogs.splice(0, questionLogs.length - 10000)
    }
    return
  }

  // Try Supabase first
  try {
    const { error } = await supabase.from('chat_logs').insert(record)
    if (error) {
      console.error('Supabase chat_logs insert error:', error.message)
      questionLogs.push({ ...record, timestamp: new Date().toISOString() })
      if (questionLogs.length > 10000) {
        questionLogs.splice(0, questionLogs.length - 10000)
      }
    }
  } catch (err) {
    console.error('Supabase insert exception:', err.message)
    questionLogs.push({ ...record, timestamp: new Date().toISOString() })
  }
}

export async function getQuestions({ agentId, unansweredOnly, since } = {}) {
  // In-memory fallback when Supabase isn't configured
  if (!supabase) {
    let filtered = questionLogs
    if (agentId) filtered = filtered.filter((q) => q.agent_id === agentId)
    if (unansweredOnly) filtered = filtered.filter((q) => q.unanswered)
    if (since) filtered = filtered.filter((q) => q.timestamp >= since)
    return filtered
  }

  try {
    let query = supabase
      .from('chat_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(500)

    if (agentId) query = query.eq('agent_id', agentId)
    if (unansweredOnly) query = query.eq('unanswered', true)
    if (since) query = query.gte('created_at', since)

    const { data, error } = await query

    if (error) {
      console.error('Supabase chat_logs query error:', error.message)
      let filtered = questionLogs
      if (agentId) filtered = filtered.filter((q) => q.agent_id === agentId)
      if (unansweredOnly) filtered = filtered.filter((q) => q.unanswered)
      if (since) filtered = filtered.filter((q) => q.timestamp >= since)
      return filtered
    }

    return data || []
  } catch (err) {
    console.error('Supabase query exception:', err.message)
    return []
  }
}

export async function clearQuestions({ agentId, before } = {}) {
  if (!supabase) return

  try {
    const cutoff = before || new Date().toISOString()
    let query = supabase.from('chat_logs').delete().lte('created_at', cutoff)
    if (agentId) query = query.eq('agent_id', agentId)
    const { error } = await query
    if (error) console.error('Supabase chat_logs delete error:', error.message)
  } catch (err) {
    console.error('Supabase delete exception:', err.message)
  }
}
