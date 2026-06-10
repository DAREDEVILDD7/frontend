import { useState } from 'react'
import { Users, TrendingUp, TrendingDown, AlertTriangle, Award, Activity } from 'lucide-react'
import EmployeeCard from './EmployeeCard.jsx'
import ScoreRing from './ScoreRing.jsx'
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer,
         BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts'

const CLASS_COLORS = {
  top_performer:    '#00FF88',
  high_performer:   '#00D4FF',
  average_performer:'#0080FF',
  needs_coaching:   '#FFB800',
  resignation_risk: '#FF4444',
  at_risk:          '#FF6B6B',
}

const CLASS_LABELS = {
  top_performer:    'Top Performer',
  high_performer:   'High Performer',
  average_performer:'Average',
  needs_coaching:   'Needs Coaching',
  resignation_risk: '⚠ Resign Risk',
  at_risk:          'At Risk',
}

function StatCard({ icon: Icon, label, value, color, sublabel }) {
  return (
    <div className="glass-card rounded-xl p-4 flex items-center gap-3">
      <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
        style={{ background: `${color}18`, border: `1px solid ${color}30` }}>
        <Icon size={18} style={{ color }} />
      </div>
      <div className="min-w-0">
        <div className="text-2xl font-bold" style={{ color, fontFamily: 'JetBrains Mono' }}>{value}</div>
        <div className="text-xs truncate" style={{ color: '#4A7A9B' }}>{label}</div>
        {sublabel && <div className="text-xs" style={{ color: '#4A7A9B' }}>{sublabel}</div>}
      </div>
    </div>
  )
}

function DeptBar({ dept, score }) {
  const pct = Math.min(100, score)
  const color = score >= 75 ? '#00FF88' : score >= 55 ? '#00D4FF' : score >= 40 ? '#FFB800' : '#FF4444'
  return (
    <div className="mb-2">
      <div className="flex justify-between mb-1 text-xs">
        <span style={{ color: '#E8F4FF' }}>{dept}</span>
        <span style={{ color, fontFamily: 'JetBrains Mono' }}>{score}</span>
      </div>
      <div className="h-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.05)' }}>
        <div className="h-1.5 rounded-full transition-all duration-1000"
          style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${color}80, ${color})` }} />
      </div>
    </div>
  )
}

const CUSTOM_TOOLTIP = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="glass-card rounded-lg p-2 text-xs border" style={{ borderColor: 'rgba(0,212,255,0.2)' }}>
      <div style={{ color: '#E8F4FF', fontFamily: 'JetBrains Mono' }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.fill || '#00D4FF' }}>{p.name}: {typeof p.value === 'number' ? p.value.toFixed(1) : p.value}</div>
      ))}
    </div>
  )
}

export default function Dashboard({ data, loading, error, onSelectEmployee }) {
  const [filter, setFilter] = useState('all')
  const [searchQ, setSearchQ] = useState('')

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <div className="relative">
        <div className="w-16 h-16 rounded-full border-2 border-t-transparent animate-spin"
          style={{ borderColor: '#00D4FF', borderTopColor: 'transparent' }} />
        <div className="absolute inset-2 w-12 h-12 rounded-full border-2 border-b-transparent animate-spin"
          style={{ borderColor: '#0080FF', borderBottomColor: 'transparent', animationDuration: '0.6s', animationDirection: 'reverse' }} />
      </div>
      <div className="text-sm typing-cursor" style={{ color: '#4A7A9B', fontFamily: 'JetBrains Mono' }}>
        Initializing AI engine
      </div>
    </div>
  )

  if (error) return (
    <div className="max-w-md mx-auto mt-20 p-6 glass-card rounded-xl text-center glow-red">
      <AlertTriangle size={32} className="mx-auto mb-3" style={{ color: '#FF4444' }} />
      <div className="font-semibold mb-1" style={{ color: '#FF4444' }}>Connection Error</div>
      <div className="text-sm mb-4" style={{ color: '#4A7A9B' }}>{error}</div>
      <div className="text-xs p-3 rounded-lg text-left" style={{ background: 'rgba(255,68,68,0.05)', color: '#4A7A9B', fontFamily: 'JetBrains Mono' }}>
        Make sure the Python backend is running:<br />
        <span style={{ color: '#00D4FF' }}>cd backend && uvicorn main:app --reload</span>
      </div>
    </div>
  )

  if (!data) return null

  const { summary, all_employees, dept_averages } = data

  const filtered = all_employees.filter(e => {
    const matchFilter = filter === 'all' || e.classification === filter
    const matchSearch = !searchQ || e.name.toLowerCase().includes(searchQ.toLowerCase()) ||
                        e.department.toLowerCase().includes(searchQ.toLowerCase())
    return matchFilter && matchSearch
  })

  const classBreakdown = Object.entries(summary.classification_breakdown || {}).map(([k, v]) => ({
    name: CLASS_LABELS[k] || k,
    value: v,
    color: CLASS_COLORS[k] || '#888',
  }))

  const radarData = [
    { axis: 'Attendance', score: all_employees.reduce((a,e)=>a+(e.scores.attendance||0),0)/all_employees.length },
    { axis: 'Tasks',      score: all_employees.reduce((a,e)=>a+(e.scores.task||0),0)/all_employees.length },
    { axis: 'Sales',      score: all_employees.filter(e=>e.scores.sales).reduce((a,e)=>a+(e.scores.sales||0),0)/Math.max(1,all_employees.filter(e=>e.scores.sales).length) },
    { axis: 'Feedback',   score: all_employees.reduce((a,e)=>a+(e.scores.feedback||0),0)/all_employees.length },
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 pt-6">

      {/* Top stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <StatCard icon={Users}         label="Total Employees"  value={summary.total_employees}    color="#00D4FF" />
        <StatCard icon={Activity}      label="Avg Score"        value={`${summary.avg_score}`}     color="#0080FF" sublabel={`±${summary.std_dev}`} />
        <StatCard icon={Award}         label="Top Performers"   value={summary.top_performers + summary.high_performers} color="#00FF88" />
        <StatCard icon={AlertTriangle} label="Risk Alerts"      value={summary.at_risk + summary.resignation_risk + summary.needs_coaching} color="#FF4444" />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">

        {/* Department performance */}
        <div className="glass-card rounded-xl p-4">
          <div className="text-xs font-semibold mb-3 tracking-widest uppercase" style={{ color: '#4A7A9B' }}>
            Department Scores
          </div>
          {Object.entries(dept_averages).map(([dept, score]) => (
            <DeptBar key={dept} dept={dept} score={score} />
          ))}
        </div>

        {/* Radar chart */}
        <div className="glass-card rounded-xl p-4">
          <div className="text-xs font-semibold mb-3 tracking-widest uppercase" style={{ color: '#4A7A9B' }}>
            Team KPI Radar
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="rgba(0,212,255,0.1)" />
              <PolarAngleAxis dataKey="axis" tick={{ fill: '#4A7A9B', fontSize: 10 }} />
              <Radar name="Avg" dataKey="score" stroke="#00D4FF" fill="#00D4FF" fillOpacity={0.15} strokeWidth={1.5} />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Classification bar */}
        <div className="glass-card rounded-xl p-4">
          <div className="text-xs font-semibold mb-3 tracking-widest uppercase" style={{ color: '#4A7A9B' }}>
            Classification Breakdown
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={classBreakdown} layout="vertical" margin={{ left: 0, right: 16 }}>
              <XAxis type="number" hide />
              <YAxis type="category" dataKey="name" tick={{ fill: '#4A7A9B', fontSize: 9 }} width={90} />
              <Tooltip content={<CUSTOM_TOOLTIP />} />
              <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                {classBreakdown.map((entry, i) => (
                  <Cell key={i} fill={entry.color} fillOpacity={0.85} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-4">
        <input
          value={searchQ}
          onChange={e => setSearchQ(e.target.value)}
          placeholder="Search employee or dept…"
          className="rounded-lg px-3 py-1.5 text-xs outline-none flex-1 min-w-[140px] max-w-[240px]"
          style={{ background: 'rgba(0,212,255,0.05)', border: '1px solid rgba(0,212,255,0.15)', color: '#E8F4FF' }}
        />
        {['all', ...Object.keys(CLASS_LABELS)].map(f => (
          <button key={f}
            onClick={() => setFilter(f)}
            className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
            style={{
              background: filter === f ? (CLASS_COLORS[f] || 'rgba(0,212,255,0.2)') + '22' : 'transparent',
              color: filter === f ? (CLASS_COLORS[f] || '#00D4FF') : '#4A7A9B',
              border: `1px solid ${filter === f ? (CLASS_COLORS[f] || '#00D4FF') + '44' : 'rgba(0,212,255,0.08)'}`,
            }}
          >
            {f === 'all' ? 'All' : CLASS_LABELS[f]}
          </button>
        ))}
      </div>

      {/* Employee grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {filtered.map((emp, i) => (
          <div key={emp.employee_id} className="animate-fade-up" style={{ animationDelay: `${i * 30}ms` }}>
            <EmployeeCard employee={emp} onClick={() => onSelectEmployee(emp.employee_id)} />
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="col-span-full text-center py-12 text-sm" style={{ color: '#4A7A9B' }}>
            No employees match the current filter.
          </div>
        )}
      </div>
    </div>
  )
}
