'use client'

import { useEffect, useState } from 'react'

function timeAgo(ts) {
  if (!ts) return ''
  const diff = Date.now() - new Date(ts).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1)  return 'just now'
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

export default function Dashboard() {
  const [data,    setData]    = useState(null)
  const [error,   setError]   = useState(null)
  const [loading, setLoading] = useState(true)
  const [tab,     setTab]     = useState('overview') // overview | unanswered | agents | activity

  async function load() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/dashboard')
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      setData(await res.json())
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const card  = 'bg-gray-900 border border-gray-800 rounded-xl p-6'
  const badge = (c) => `inline-block text-xs px-2 py-0.5 rounded-full font-medium ${c}`

  if (loading) return (
    <div className="min-h-screen bg-black flex items-center justify-center text-gray-400">
      Loading dashboard…
    </div>
  )

  if (error) return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-4">
      <p className="text-red-400">Error: {error}</p>
      <button onClick={load} className="px-4 py-2 bg-purple-700 hover:bg-purple-600 text-white rounded-lg text-sm">
        Retry
      </button>
    </div>
  )

  const d = data

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Owner Dashboard</h1>
          <p className="text-gray-500 text-sm mt-0.5">All agents · All time</p>
        </div>
        <button
          onClick={load}
          className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg text-sm transition-colors"
        >
          ↻ Refresh
        </button>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">

        {/* Stat cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Messages',   value: d.totalMessages,   color: 'text-purple-400' },
            { label: 'Unanswered',       value: d.unansweredCount, color: 'text-red-400',
              sub: `${d.unansweredRate}% of all` },
            { label: 'Active Agents',    value: d.totalAgents,     color: 'text-green-400' },
            { label: 'Today',            value: d.todayCount,      color: 'text-blue-400',
              sub: `${d.weekCount} this week` },
          ].map(s => (
            <div key={s.label} className={card}>
              <p className="text-gray-500 text-sm">{s.label}</p>
              <p className={`text-4xl font-bold mt-2 ${s.color}`}>{s.value}</p>
              {s.sub && <p className="text-gray-600 text-xs mt-1">{s.sub}</p>}
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-gray-800 pb-0">
          {[
            { id: 'overview',   label: 'Top Topics' },
            { id: 'unanswered', label: `Unanswered (${d.unansweredCount})` },
            { id: 'agents',     label: `Agents (${d.totalAgents})` },
            { id: 'activity',   label: 'Recent Activity' },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-4 py-2.5 text-sm font-medium rounded-t-lg transition-colors ${
                tab === t.id
                  ? 'bg-gray-900 text-white border border-b-0 border-gray-800'
                  : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab: Top Topics */}
        {tab === 'overview' && (
          <div className={card}>
            <h2 className="text-gray-300 font-semibold mb-5">Most Common Topics</h2>
            {d.topTopics.length === 0 ? (
              <p className="text-gray-600 text-sm">No messages yet.</p>
            ) : (
              <div className="space-y-3">
                {d.topTopics.map((t, i) => {
                  const max   = d.topTopics[0].count
                  const width = Math.round((t.count / max) * 100)
                  return (
                    <div key={t.word} className="flex items-center gap-3">
                      <span className="text-gray-500 text-xs w-5 text-right">{i + 1}</span>
                      <span className="text-gray-300 text-sm w-28 truncate capitalize">{t.word}</span>
                      <div className="flex-1 bg-gray-800 rounded-full h-2">
                        <div
                          className="bg-purple-600 rounded-full h-2 transition-all"
                          style={{ width: `${width}%` }}
                        />
                      </div>
                      <span className="text-gray-500 text-xs w-6 text-right">{t.count}</span>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* Tab: Unanswered */}
        {tab === 'unanswered' && (
          <div className={card}>
            <h2 className="text-gray-300 font-semibold mb-5">Unanswered Questions</h2>
            {d.unansweredQuestions.length === 0 ? (
              <p className="text-gray-600 text-sm">No unanswered questions. 🎉</p>
            ) : (
              <div className="divide-y divide-gray-800">
                {d.unansweredQuestions.map((q, i) => (
                  <div key={i} className="py-3 flex items-start gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="text-gray-200 text-sm">{q.question}</p>
                      <p className="text-gray-600 text-xs mt-1">{q.businessName}</p>
                    </div>
                    <span className="text-gray-600 text-xs whitespace-nowrap">{timeAgo(q.timestamp)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab: Agents */}
        {tab === 'agents' && (
          <div className={card}>
            <h2 className="text-gray-300 font-semibold mb-5">Per-Agent Breakdown</h2>
            {d.agentStats.length === 0 ? (
              <p className="text-gray-600 text-sm">No agents yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-gray-500 text-left border-b border-gray-800">
                      <th className="pb-3 font-medium">Business</th>
                      <th className="pb-3 font-medium">Agent ID</th>
                      <th className="pb-3 font-medium text-right">Messages</th>
                      <th className="pb-3 font-medium text-right">Unanswered</th>
                      <th className="pb-3 font-medium text-right">Last Active</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800">
                    {d.agentStats.map(a => (
                      <tr key={a.agentId} className="text-gray-300">
                        <td className="py-3">
                          <p className="font-medium">{a.businessName}</p>
                          {a.businessEmail && <p className="text-gray-600 text-xs">{a.businessEmail}</p>}
                        </td>
                        <td className="py-3 text-gray-500 font-mono text-xs">{a.agentId}</td>
                        <td className="py-3 text-right text-purple-400 font-semibold">{a.total}</td>
                        <td className="py-3 text-right">
                          {a.unanswered > 0
                            ? <span className={badge('bg-red-900/40 text-red-400')}>{a.unanswered}</span>
                            : <span className={badge('bg-green-900/40 text-green-500')}>0</span>}
                        </td>
                        <td className="py-3 text-right text-gray-500 text-xs">{timeAgo(a.lastActive)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Tab: Recent Activity */}
        {tab === 'activity' && (
          <div className={card}>
            <h2 className="text-gray-300 font-semibold mb-5">Recent Activity</h2>
            {d.recentActivity.length === 0 ? (
              <p className="text-gray-600 text-sm">No activity yet.</p>
            ) : (
              <div className="divide-y divide-gray-800">
                {d.recentActivity.map((r, i) => (
                  <div key={i} className="py-3 flex items-start gap-3">
                    <span className={`mt-0.5 w-2 h-2 rounded-full flex-shrink-0 ${r.unanswered ? 'bg-red-500' : 'bg-green-500'}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-gray-200 text-sm truncate">{r.question}</p>
                      <p className="text-gray-600 text-xs mt-0.5">{r.businessName}</p>
                    </div>
                    <span className="text-gray-600 text-xs whitespace-nowrap">{timeAgo(r.timestamp)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <p className="text-gray-700 text-xs text-center">
          Green dot = answered · Red dot = unanswered
        </p>
      </div>
    </div>
  )
}
