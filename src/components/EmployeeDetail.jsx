import { useEffect, useState } from 'react'
import { ChevronLeft, AlertTriangle, TrendingUp, TrendingDown, Minus,
         CheckCircle, XCircle, Clock, Star } from 'lucide-react'
import ScoreRing from './ScoreRing.jsx'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
         RadarChart, Radar, PolarGrid, PolarAngleAxis } from 'recharts'

const CLASS_COLORS = {
  top_performer:    '#00FF88', high_performer: '#00D4FF',
  average_performer:'#0080FF', needs_coaching: '#FFB800',
  resignation_risk: '#FF4444', at_risk:        '#FF6B6B',
}
const CLASS_LABELS = {
  top_performer:'Top Performer', high_performer:'High Performer',
  average_performer:'Average', needs_coaching:'Needs Coaching',
  resignation_risk:'⚠ Resignation Risk', at_risk:'At Risk',
}
const FLAG_LABELS = {
  HIGH_ABSENTEEISM:         '🔴 High Absenteeism',
  CHRONIC_LATENESS:         '🟡 Chronic Lateness',
  DECLINING_ATTENDANCE:     '📉 Declining Attendance',
  EXCESSIVE_OVERDUE_TASKS:  '🔴 Excessive Overdue Tasks',
  LOW_TASK_COMPLETION:      '🟡 Low Task Completion',
  TASK_PERFORMANCE_DECLINING:'📉 Task Trend Declining',
  BELOW_SALES_TARGET:       '🟡 Below Sales Target',
  SALES_DECLINING:          '📉 Sales Declining',
  POOR_PEER_FEEDBACK:       '🔴 Poor Peer Feedback',
  FEEDBACK_DECLINING:       '📉 Feedback Declining',
  OVERALL_UNDERPERFORMANCE: '🔴 Overall Underperformance',
}

function TrendPill({ value, label }) {
  const up = value > 2
  const dn = value < -2
  const color = up ? '#00FF88' : dn ? '#FF4444' : '#4A7A9B'
  const Icon = up ? TrendingUp : dn ? TrendingDown : Minus
  return (
    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg"
      style={{ background: `${color}12`, border: `1px solid ${color}30` }}>
      <Icon size={12} style={{ color }} />
      <span className="text-xs" style={{ color }}>{label} {value > 0 ? '+' : ''}{value.toFixed(1)}</span>
    </div>
  )
}

const TOOLTIP = ({ active, payload }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="glass-card p-2 rounded text-xs" style={{ border: '1px solid rgba(0,212,255,0.2)' }}>
      {payload.map((p, i) => <div key={i} style={{ color: p.stroke }}>{p.name}: {Number(p.value).toFixed(1)}</div>)}
    </div>
  )
}

export default function EmployeeDetail({ employeeId, api, onBack }) {
  const [data, setData] = useState(null)
  const [history, setHistory] = useState([])
  const [tasks, setTasks] = useState([])
  const [feedback, setFeedback] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [tab, setTab] = useState('overview')

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        setError(null)
        const [scoreRes, histRes, taskRes, fbRes] = await Promise.all([
          fetch(`${api}/api/score/${employeeId}`),
          fetch(`${api}/api/employee/${employeeId}/history`),
          fetch(`${api}/api/employee/${employeeId}/tasks`),
          fetch(`${api}/api/employee/${employeeId}/feedback`),
        ])
        if (!scoreRes.ok) throw new Error('Failed to load employee data')
        const [score, hist, tsk, fb] = await Promise.all([
          scoreRes.json(), histRes.json(), taskRes.json(), fbRes.json()
        ])
        setData(score)
        setHistory(hist.slice(0, 10).reverse())
        setTasks(tsk)
        setFeedback(fb)
      } catch (e) {
        setError(e.message)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [employeeId, api])

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-12 h-12 rounded-full border-2 border-t-transparent animate-spin"
        style={{ borderColor: '#00D4FF', borderTopColor: 'transparent' }} />
    </div>
  )
  if (error) return (
    <div className="max-w-md mx-auto mt-16 p-6 glass-card rounded-xl text-center">
      <AlertTriangle size={28} className="mx-auto mb-2" style={{ color: '#FF4444' }} />
      <div style={{ color: '#FF4444' }}>{error}</div>
      <button onClick={onBack} className="mt-4 text-sm" style={{ color: '#4A7A9B' }}>← Back</button>
    </div>
  )
  if (!data) return null

  const classColor = CLASS_COLORS[data.classification] || '#00D4FF'
  const initials = data.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()

  const radarData = [
    { axis: 'Attendance', score: data.scores.attendance },
    { axis: 'Tasks',      score: data.scores.task },
    { axis: 'Sales',      score: data.scores.sales ?? 50 },
    { axis: 'Feedback',   score: data.scores.feedback },
  ]

  const histChart = history.map((h, i) => ({
    idx: i + 1,
    composite: h.composite_score,
    attendance: h.attendance_score,
    task: h.task_score,
    feedback: h.feedback_score,
  }))

  const TABS = ['overview', 'tasks', 'feedback', 'history']

  return (
    <div className="max-w-4xl mx-auto px-4 pt-6">

      {/* Back */}
      <button onClick={onBack} className="flex items-center gap-1.5 mb-4 text-sm transition-colors hover:opacity-100"
        style={{ color: '#4A7A9B' }}>
        <ChevronLeft size={16} /> Back to Dashboard
      </button>

      {/* Profile card */}
      <div className="glass-card rounded-2xl p-5 mb-4"
        style={{ border: `1px solid ${classColor}30` }}>
        <div className="flex items-start gap-4 flex-wrap sm:flex-nowrap">
          {/* Avatar */}
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-xl font-bold flex-shrink-0"
            style={{ background: `linear-gradient(135deg,${classColor}22,${classColor}44)`, color: classColor, border: `1px solid ${classColor}44` }}>
            {initials}
          </div>
          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h2 className="text-lg font-bold" style={{ color: '#E8F4FF' }}>{data.name}</h2>
              <span className="text-xs px-2 py-0.5 rounded-full"
                style={{ background: `${classColor}18`, color: classColor, border: `1px solid ${classColor}30` }}>
                {CLASS_LABELS[data.classification] || data.classification}
              </span>
            </div>
            <div className="text-sm" style={{ color: '#4A7A9B' }}>{data.role} · {data.department}</div>
            <div className="text-xs mt-1" style={{ color: '#1E3A52', fontFamily: 'JetBrains Mono' }}>
              Hired {data.hire_date}
            </div>
            {/* Trend pills */}
            <div className="flex flex-wrap gap-2 mt-3">
              <TrendPill value={data.trends.attendance} label="Attendance" />
              <TrendPill value={data.trends.task}       label="Tasks" />
              {data.trends.sales != null && <TrendPill value={data.trends.sales} label="Sales" />}
              <TrendPill value={data.trends.feedback}   label="Feedback" />
            </div>
          </div>
          {/* Score ring */}
          <div className="flex-shrink-0">
            <ScoreRing score={data.composite_score} size={90} strokeWidth={7} />
          </div>
        </div>
      </div>

      {/* Risk flags */}
      {data.risk_flags?.length > 0 && (
        <div className="glass-card rounded-xl p-4 mb-4 glow-red"
          style={{ border: '1px solid rgba(255,68,68,0.25)' }}>
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle size={15} style={{ color: '#FF4444' }} />
            <span className="text-sm font-semibold" style={{ color: '#FF4444' }}>Risk Flags Detected</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {data.risk_flags.map(f => (
              <span key={f} className="text-xs px-2 py-1 rounded-lg"
                style={{ background: 'rgba(255,68,68,0.08)', color: '#FF8888', border: '1px solid rgba(255,68,68,0.2)' }}>
                {FLAG_LABELS[f] || f}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* AI Insights */}
      {data.insights?.length > 0 && (
        <div className="glass-card rounded-xl p-4 mb-4"
          style={{ border: '1px solid rgba(0,212,255,0.15)', background: 'rgba(0,212,255,0.03)' }}>
          <div className="text-xs font-semibold tracking-widest uppercase mb-3" style={{ color: '#00D4FF' }}>
            🤖 AI Insights
          </div>
          <div className="space-y-2">
            {data.insights.map((ins, i) => (
              <div key={i} className="flex gap-2 text-sm animate-fade-up" style={{ animationDelay: `${i * 80}ms` }}>
                <span style={{ color: '#00D4FF', flexShrink: 0 }}>▸</span>
                <span style={{ color: '#C0D8F0' }}>{ins}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 mb-4 overflow-x-auto pb-1">
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)}
            className="px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all"
            style={{
              background: tab === t ? 'rgba(0,212,255,0.15)' : 'transparent',
              color: tab === t ? '#00D4FF' : '#4A7A9B',
              border: `1px solid ${tab === t ? 'rgba(0,212,255,0.3)' : 'transparent'}`,
            }}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Score radar */}
          <div className="glass-card rounded-xl p-4">
            <div className="text-xs font-semibold tracking-widest uppercase mb-3" style={{ color: '#4A7A9B' }}>Performance Radar</div>
            <ResponsiveContainer width="100%" height={200}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="rgba(0,212,255,0.1)" />
                <PolarAngleAxis dataKey="axis" tick={{ fill: '#4A7A9B', fontSize: 10 }} />
                <Radar name="Score" dataKey="score" stroke={classColor} fill={classColor} fillOpacity={0.15} strokeWidth={1.5} />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          {/* Score breakdown */}
          <div className="glass-card rounded-xl p-4">
            <div className="text-xs font-semibold tracking-widest uppercase mb-4" style={{ color: '#4A7A9B' }}>Score Breakdown</div>
            {[
              { label: 'Attendance', value: data.scores.attendance, color: '#00D4FF', detail: `${data.details.attendance?.attendance_rate ?? '—'}% rate` },
              { label: 'Task Completion', value: data.scores.task, color: '#0080FF', detail: `${data.details.task?.completion_rate ?? '—'}% done` },
              { label: 'Sales', value: data.scores.sales, color: '#00FF88', detail: data.details.sales ? `${data.details.sales.avg_achievement_pct}% target` : 'N/A' },
              { label: 'Feedback', value: data.scores.feedback, color: '#A855F7', detail: `${data.details.feedback?.avg_rating ?? '—'}/5 rating` },
            ].map(({ label, value, color, detail }) => (
              <div key={label} className="mb-3">
                <div className="flex justify-between mb-1">
                  <span className="text-xs" style={{ color: '#E8F4FF' }}>{label}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs" style={{ color: '#4A7A9B' }}>{detail}</span>
                    <span className="text-xs font-bold" style={{ color, fontFamily: 'JetBrains Mono' }}>
                      {value != null ? Math.round(value) : '—'}
                    </span>
                  </div>
                </div>
                <div className="h-2 rounded-full" style={{ background: 'rgba(255,255,255,0.05)' }}>
                  {value != null && (
                    <div className="h-2 rounded-full" style={{ width: `${value}%`, background: `linear-gradient(90deg,${color}66,${color})` }} />
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Attendance stats */}
          <div className="glass-card rounded-xl p-4">
            <div className="text-xs font-semibold tracking-widest uppercase mb-3" style={{ color: '#4A7A9B' }}>Attendance (Last 65 Days)</div>
            {data.details.attendance && (
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Present', value: data.details.attendance.present, color: '#00FF88' },
                  { label: 'Absent',  value: data.details.attendance.absent,  color: '#FF4444' },
                  { label: 'Late',    value: data.details.attendance.late,    color: '#FFB800' },
                  { label: 'Late Mins',value: data.details.attendance.late_minutes_total, color: '#FF6B6B' },
                ].map(({ label, value, color }) => (
                  <div key={label} className="text-center p-2 rounded-lg"
                    style={{ background: `${color}0A`, border: `1px solid ${color}20` }}>
                    <div className="font-bold" style={{ color, fontFamily: 'JetBrains Mono' }}>{value}</div>
                    <div className="text-xs" style={{ color: '#4A7A9B' }}>{label}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Task stats */}
          <div className="glass-card rounded-xl p-4">
            <div className="text-xs font-semibold tracking-widest uppercase mb-3" style={{ color: '#4A7A9B' }}>Task Summary</div>
            {data.details.task && (
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Completed',   value: data.details.task.completed,    color: '#00FF88' },
                  { label: 'Overdue',     value: data.details.task.overdue,      color: '#FF4444' },
                  { label: 'In Progress', value: data.details.task.in_progress,  color: '#FFB800' },
                  { label: 'Total',       value: data.details.task.total_tasks,  color: '#00D4FF' },
                ].map(({ label, value, color }) => (
                  <div key={label} className="text-center p-2 rounded-lg"
                    style={{ background: `${color}0A`, border: `1px solid ${color}20` }}>
                    <div className="font-bold" style={{ color, fontFamily: 'JetBrains Mono' }}>{value}</div>
                    <div className="text-xs" style={{ color: '#4A7A9B' }}>{label}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {tab === 'tasks' && (
        <div className="glass-card rounded-xl p-4">
          <div className="text-xs font-semibold tracking-widest uppercase mb-4" style={{ color: '#4A7A9B' }}>Recent Tasks</div>
          <div className="space-y-2">
            {tasks.map(t => {
              const isCompleted = t.status === 'completed'
              const isOverdue   = t.status === 'overdue'
              const color = isCompleted ? '#00FF88' : isOverdue ? '#FF4444' : '#FFB800'
              const Icon = isCompleted ? CheckCircle : isOverdue ? XCircle : Clock
              return (
                <div key={t.id} className="flex items-start gap-3 p-3 rounded-lg"
                  style={{ background: `${color}08`, border: `1px solid ${color}15` }}>
                  <Icon size={15} style={{ color, flexShrink: 0, marginTop: 1 }} />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm truncate" style={{ color: '#E8F4FF' }}>{t.title}</div>
                    <div className="text-xs mt-0.5" style={{ color: '#4A7A9B' }}>
                      Due: {t.due_date} · Priority: <span style={{ color }}>{t.priority}</span>
                    </div>
                  </div>
                  <span className="text-xs flex-shrink-0" style={{ color }}>{t.status}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {tab === 'feedback' && (
        <div className="glass-card rounded-xl p-4">
          <div className="text-xs font-semibold tracking-widest uppercase mb-4" style={{ color: '#4A7A9B' }}>Customer & Peer Feedback</div>
          <div className="space-y-2">
            {feedback.map(f => {
              const color = f.score >= 4 ? '#00FF88' : f.score >= 3 ? '#FFB800' : '#FF4444'
              return (
                <div key={f.id} className="p-3 rounded-lg" style={{ background: `${color}08`, border: `1px solid ${color}15` }}>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="flex gap-0.5">
                      {[1,2,3,4,5].map(s => (
                        <Star key={s} size={11} style={{ color: s <= f.score ? '#FFB800' : '#1E3A52' }} fill={s <= f.score ? '#FFB800' : 'none'} />
                      ))}
                    </div>
                    <span className="text-xs" style={{ color: '#4A7A9B' }}>{f.category}</span>
                    <span className="text-xs ml-auto" style={{ color: '#1E3A52', fontFamily: 'JetBrains Mono' }}>{f.date}</span>
                  </div>
                  {f.comment && <div className="text-xs" style={{ color: '#C0D8F0' }}>{f.comment}</div>}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {tab === 'history' && (
        <div className="glass-card rounded-xl p-4">
          <div className="text-xs font-semibold tracking-widest uppercase mb-3" style={{ color: '#4A7A9B' }}>Score History</div>
          {histChart.length > 1 ? (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={histChart}>
                <XAxis dataKey="idx" tick={{ fill: '#4A7A9B', fontSize: 10 }} />
                <YAxis domain={[0, 100]} tick={{ fill: '#4A7A9B', fontSize: 10 }} />
                <Tooltip content={<TOOLTIP />} />
                <Line type="monotone" dataKey="composite"  stroke="#00D4FF" strokeWidth={2} dot={false} name="Composite" />
                <Line type="monotone" dataKey="attendance" stroke="#00FF88" strokeWidth={1.5} dot={false} name="Attendance" strokeDasharray="4 2" />
                <Line type="monotone" dataKey="task"       stroke="#0080FF" strokeWidth={1.5} dot={false} name="Tasks" strokeDasharray="4 2" />
                <Line type="monotone" dataKey="feedback"   stroke="#A855F7" strokeWidth={1.5} dot={false} name="Feedback" strokeDasharray="4 2" />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-sm text-center py-8" style={{ color: '#4A7A9B' }}>
              Run analysis multiple times to build history.
            </div>
          )}
        </div>
      )}
    </div>
  )
}
