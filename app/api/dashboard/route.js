import { getQuestions } from '@/lib/question-store'

const corsHeaders = { 'Access-Control-Allow-Origin': '*' }

export async function GET() {
  try {
    const all = await getQuestions({})

    const now = new Date()
    const todayStart = new Date(now); todayStart.setHours(0,0,0,0)
    const weekStart  = new Date(now); weekStart.setDate(now.getDate() - 7)

    const ts = r => new Date(r.created_at || r.timestamp || 0)

    const todayLogs   = all.filter(r => ts(r) >= todayStart)
    const weekLogs    = all.filter(r => ts(r) >= weekStart)
    const unanswered  = all.filter(r => r.unanswered)

    // ─── Per-agent stats ─────────────────────────────────────────────────────
    const agentMap = {}
    for (const r of all) {
      const id = r.agent_id || 'demo'
      if (!agentMap[id]) {
        agentMap[id] = {
          agentId: id,
          businessName:  r.business_name  || id,
          businessEmail: r.business_email || '',
          total: 0, unanswered: 0,
          lastActive: ts(r).toISOString(),
        }
      }
      agentMap[id].total++
      if (r.unanswered) agentMap[id].unanswered++
      if (ts(r) > new Date(agentMap[id].lastActive)) {
        agentMap[id].lastActive = ts(r).toISOString()
      }
    }

    // ─── Top topics (simple word frequency, stop words removed) ─────────────
    const STOP = new Set(['the','a','an','is','are','was','were','be','been','being',
      'have','has','had','do','does','did','will','would','could','should','may','might',
      'can','to','of','in','on','at','for','with','by','from','that','this','it','i',
      'you','my','your','me','we','our','what','how','when','where','who','why',
      'and','or','but','if','as','so','not','no','yes','please','thank','thanks'])

    const wordCount = {}
    for (const r of all) {
      const words = (r.question || '').toLowerCase().replace(/[^a-z0-9 ]/g, '').split(/\s+/)
      for (const w of words) {
        if (w.length > 3 && !STOP.has(w)) {
          wordCount[w] = (wordCount[w] || 0) + 1
        }
      }
    }
    const topTopics = Object.entries(wordCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 12)
      .map(([word, count]) => ({ word, count }))

    return Response.json({
      totalMessages:  all.length,
      todayCount:     todayLogs.length,
      weekCount:      weekLogs.length,
      unansweredCount: unanswered.length,
      totalAgents:    Object.keys(agentMap).length,
      unansweredRate: all.length ? Math.round((unanswered.length / all.length) * 100) : 0,
      agentStats:     Object.values(agentMap).sort((a, b) => b.total - a.total),
      unansweredQuestions: unanswered.slice(0, 60).map(r => ({
        question:     r.question,
        businessName: r.business_name || r.agent_id || 'Unknown',
        timestamp:    (r.created_at || r.timestamp || ''),
      })),
      recentActivity: all.slice(0, 40).map(r => ({
        question:     r.question,
        unanswered:   r.unanswered,
        businessName: r.business_name || r.agent_id || 'Unknown',
        timestamp:    (r.created_at || r.timestamp || ''),
      })),
      topTopics,
    }, { headers: corsHeaders })
  } catch (err) {
    console.error('Dashboard API error:', err.message)
    return Response.json({ error: err.message }, { status: 500, headers: corsHeaders })
  }
}
