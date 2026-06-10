import ScoreRing from './ScoreRing.jsx'
import { TrendingUp, TrendingDown, Minus, AlertTriangle, Star } from 'lucide-react'

const CLASS_CONFIG = {
  top_performer:    { label: 'Top Performer',  color: '#00FF88', bg: 'rgba(0,255,136,0.08)',  border: 'rgba(0,255,136,0.25)' },
  high_performer:   { label: 'High Performer', color: '#00D4FF', bg: 'rgba(0,212,255,0.08)',  border: 'rgba(0,212,255,0.25)' },
  average_performer:{ label: 'Average',        color: '#0080FF', bg: 'rgba(0,128,255,0.08)',  border: 'rgba(0,128,255,0.2)'  },
  needs_coaching:   { label: 'Needs Coaching', color: '#FFB800', bg: 'rgba(255,184,0,0.08)',  border: 'rgba(255,184,0,0.25)' },
  resignation_risk: { label: '⚠ Resign Risk',  color: '#FF4444', bg: 'rgba(255,68,68,0.1)',   border: 'rgba(255,68,68,0.35)' },
  at_risk:          { label: 'At Risk',         color: '#FF6B6B', bg: 'rgba(255,107,107,0.08)',border: 'rgba(255,107,107,0.3)'},
}

function MiniBar({ label, value, color }) {
  return (
    <div>
      <div className="flex justify-between text-xs mb-0.5">
        <span style={{ color: '#4A7A9B' }}>{label}</span>
        <span style={{ color, fontFamily: 'JetBrains Mono', fontSize: '10px' }}>{Math.round(value ?? 0)}</span>
      </div>
      <div className="h-1 rounded-full" style={{ background: 'rgba(255,255,255,0.05)' }}>
        <div className="h-1 rounded-full" style={{ width: `${value ?? 0}%`, background: color, opacity: 0.8 }} />
      </div>
    </div>
  )
}

function TrendIcon({ value }) {
  if (value > 2)  return <TrendingUp  size={11} style={{ color: '#00FF88' }} />
  if (value < -2) return <TrendingDown size={11} style={{ color: '#FF4444' }} />
  return <Minus size={11} style={{ color: '#4A7A9B' }} />
}

export default function EmployeeCard({ employee: e, onClick }) {
  const cfg = CLASS_CONFIG[e.classification] || CLASS_CONFIG.average_performer
  const avgTrend = ((e.trends.attendance||0) + (e.trends.task||0) + (e.trends.feedback||0)) / 3
  const initials = e.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()

  return (
    <button
      onClick={onClick}
      className="w-full text-left glass-card rounded-xl p-4 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
      style={{ border: `1px solid ${cfg.border}`, background: cfg.bg }}
    >
      {/* Header */}
      <div className="flex items-start gap-3 mb-3">
        {/* Avatar */}
        <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
          style={{ background: `linear-gradient(135deg,${cfg.color}22,${cfg.color}44)`, color: cfg.color, border: `1px solid ${cfg.color}44` }}>
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-sm truncate" style={{ color: '#E8F4FF' }}>{e.name}</div>
          <div className="text-xs truncate" style={{ color: '#4A7A9B' }}>{e.role}</div>
          <div className="flex items-center gap-1 mt-1">
            <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}`, fontSize: '10px' }}>
              {cfg.label}
            </span>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1">
          <ScoreRing score={e.composite_score} size={48} strokeWidth={4} />
          <div className="flex items-center gap-0.5">
            <TrendIcon value={avgTrend} />
          </div>
        </div>
      </div>

      {/* Mini bars */}
      <div className="space-y-1.5">
        <MiniBar label="Attendance" value={e.scores.attendance} color="#00D4FF" />
        <MiniBar label="Tasks"      value={e.scores.task}       color="#0080FF" />
        {e.scores.sales != null && <MiniBar label="Sales" value={e.scores.sales} color="#00FF88" />}
        <MiniBar label="Feedback"   value={e.scores.feedback}   color="#A855F7" />
      </div>

      {/* Risk flags */}
      {e.risk_flags?.length > 0 && (
        <div className="mt-3 flex items-center gap-1.5">
          <AlertTriangle size={11} style={{ color: '#FF4444', flexShrink: 0 }} />
          <span className="text-xs truncate" style={{ color: '#FF4444' }}>
            {e.risk_flags.length} risk flag{e.risk_flags.length > 1 ? 's' : ''}
          </span>
        </div>
      )}

      {/* Dept badge */}
      <div className="mt-2 text-xs" style={{ color: '#1E3A52', fontFamily: 'JetBrains Mono' }}>
        {e.department}
      </div>
    </button>
  )
}
