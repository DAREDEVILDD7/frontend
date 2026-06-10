import { useState, useRef, useEffect, useCallback } from 'react'
import { Brain, Play, Pause, SkipForward, AlertTriangle, Award, Users } from 'lucide-react'
import ScoreRing from './ScoreRing.jsx'

const CLASS_COLORS = {
  top_performer:    '#00FF88', high_performer:   '#00D4FF',
  average_performer:'#0080FF', needs_coaching:   '#FFB800',
  resignation_risk: '#FF4444', at_risk:          '#FF6B6B',
}
const CLASS_LABELS = {
  top_performer:'Top Performer', high_performer:'High Performer',
  average_performer:'Average', needs_coaching:'Needs Coaching',
  resignation_risk:'⚠ Resign Risk', at_risk:'At Risk',
}

const AI_STEPS = [
  { id: 'init',       label: 'Initializing Neural Scoring Engine',    duration: 800  },
  { id: 'fetch',      label: 'Fetching Employee Data Matrix',         duration: 600  },
  { id: 'attendance', label: 'Computing Attendance Analytics',        duration: 700  },
  { id: 'tasks',      label: 'Evaluating Task Completion Vectors',    duration: 700  },
  { id: 'sales',      label: 'Analyzing Sales Performance Metrics',   duration: 600  },
  { id: 'feedback',   label: 'Processing Peer Feedback Signals',      duration: 600  },
  { id: 'composite',  label: 'Calculating Composite AI Scores',       duration: 800  },
  { id: 'risk',       label: 'Running Risk Anomaly Detection',        duration: 700  },
  { id: 'insights',   label: 'Generating Behavioral Insights',        duration: 900  },
  { id: 'classify',   label: 'Classifying Employee Profiles',         duration: 500  },
  { id: 'done',       label: 'Analysis Complete',                     duration: 400  },
]

function ProgressBar({ step }) {
  const pct = (step / (AI_STEPS.length - 1)) * 100
  return (
    <div>
      <div className="flex justify-between text-xs mb-1.5">
        <span style={{ color: '#4A7A9B', fontFamily: 'JetBrains Mono' }}>{AI_STEPS[step]?.label || 'Processing...'}</span>
        <span style={{ color: '#00D4FF', fontFamily: 'JetBrains Mono' }}>{Math.round(pct)}%</span>
      </div>
      <div className="h-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.05)' }}>
        <div className="h-1.5 rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, background: 'linear-gradient(90deg,#0080FF,#00D4FF)' }} />
      </div>
    </div>
  )
}

function LogLine({ text, type = 'info', delay = 0 }) {
  const colors = { info: '#4A7A9B', success: '#00FF88', warn: '#FFB800', error: '#FF4444', data: '#00D4FF' }
  const prefixes = { info: '▸', success: '✓', warn: '⚠', error: '✗', data: '◈' }
  return (
    <div className="text-xs font-mono animate-fade-up flex gap-2"
      style={{ color: colors[type] || colors.info, animationDelay: `${delay}ms`, fontFamily: 'JetBrains Mono' }}>
      <span style={{ color: colors[type], opacity: 0.6 }}>{prefixes[type]}</span>
      <span>{text}</span>
    </div>
  )
}

function ResultCard({ emp, delay, onClick }) {
  const color = CLASS_COLORS[emp.classification] || '#00D4FF'
  const initials = emp.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
  return (
    <button
      onClick={() => onClick(emp.employee_id)}
      className="w-full text-left p-3 rounded-xl transition-all duration-200 hover:scale-[1.02] animate-fade-up"
      style={{
        background: `${color}08`,
        border: `1px solid ${color}25`,
        animationDelay: `${delay}ms`,
      }}
    >
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
          style={{ background: `${color}22`, color, border: `1px solid ${color}44` }}>
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium truncate" style={{ color: '#E8F4FF' }}>{emp.name}</div>
          <div className="text-xs truncate" style={{ color: '#4A7A9B' }}>{emp.department}</div>
          <div className="text-xs mt-0.5" style={{ color }}>{CLASS_LABELS[emp.classification]}</div>
        </div>
        <ScoreRing score={emp.composite_score} size={52} strokeWidth={4} />
      </div>
      {emp.risk_flags?.length > 0 && (
        <div className="mt-2 flex items-center gap-1">
          <AlertTriangle size={10} style={{ color: '#FF4444' }} />
          <span className="text-xs" style={{ color: '#FF8888' }}>{emp.risk_flags.length} risk flag(s)</span>
        </div>
      )}
    </button>
  )
}

export default function LiveAnalysis({ api, onSelectEmployee }) {
  const [phase, setPhase] = useState('idle')  // idle | running | done
  const [step, setStep] = useState(0)
  const [logs, setLogs] = useState([])
  const [results, setResults] = useState(null)
  const [currentEmp, setCurrentEmp] = useState(null)
  const [empIndex, setEmpIndex] = useState(0)
  const logsRef = useRef(null)
  const runningRef = useRef(false)

  const addLog = useCallback((text, type = 'info') => {
    setLogs(prev => [...prev.slice(-60), { text, type, id: Date.now() + Math.random() }])
  }, [])

  useEffect(() => {
    if (logsRef.current) {
      logsRef.current.scrollTop = logsRef.current.scrollHeight
    }
  }, [logs])

  const runAnalysis = useCallback(async () => {
    if (runningRef.current) return
    runningRef.current = true
    setPhase('running')
    setStep(0)
    setLogs([])
    setResults(null)
    setCurrentEmp(null)

    try {
      // Step through AI phases
      for (let i = 0; i < AI_STEPS.length - 1; i++) {
        if (!runningRef.current) break
        setStep(i)
        const s = AI_STEPS[i]

        if (i === 0) addLog('EPI v2.0 — Employee Performance Intelligence Engine', 'data')
        if (i === 1) {
          addLog('Connecting to data matrix...', 'info')
          const empRes = await fetch(`${api}/api/employees`)
          const emps = await empRes.json()
          addLog(`Loaded ${emps.length} employee records`, 'success')
        }
        if (i === 2) addLog('Parsing attendance logs (90-day window)...', 'info')
        if (i === 3) addLog('Evaluating task priority weights (low→critical)...', 'info')
        if (i === 4) addLog('Computing 6-month sales achievement ratios...', 'info')
        if (i === 5) addLog('Aggregating multi-category feedback scores...', 'info')
        if (i === 6) addLog('Applying weighted composite formula...', 'info')
        if (i === 7) addLog('Running Z-score anomaly detection on all KPIs...', 'info')
        if (i === 8) {
          addLog('Generating behavioral insight patterns...', 'info')
          // Fetch full results here
          const res = await fetch(`${api}/api/scores/all`)
          const data = await res.json()
          setResults(data)
          data.employees.forEach((e, idx) => {
            setTimeout(() => setEmpIndex(idx), idx * 120)
          })
          addLog(`Processed ${data.employees.length} employee profiles`, 'success')
          data.employees.forEach(e => {
            if (e.risk_flags?.length) {
              addLog(`${e.name}: ${e.risk_flags.length} risk flag(s) — ${CLASS_LABELS[e.classification]}`, 'warn')
            } else if (e.classification === 'top_performer') {
              addLog(`${e.name}: Top performer detected (${e.composite_score})`, 'success')
            }
          })
        }
        if (i === 9) {
          if (results) {
            const { summary } = results
            addLog(`Classification complete — ${summary?.top_performers || 0} top performers identified`, 'success')
            if (summary?.resignation_risk > 0) {
              addLog(`⚠ ${summary.resignation_risk} employee(s) flagged as resignation risk`, 'error')
            }
          }
        }

        await new Promise(r => setTimeout(r, s.duration))
      }

      setStep(AI_STEPS.length - 1)
      addLog('Analysis pipeline complete. Rendering results.', 'success')
      setPhase('done')

    } catch (e) {
      addLog(`Error: ${e.message}`, 'error')
      setPhase('idle')
    } finally {
      runningRef.current = false
    }
  }, [api, addLog])

  const reset = () => {
    runningRef.current = false
    setPhase('idle')
    setStep(0)
    setLogs([])
    setResults(null)
    setCurrentEmp(null)
  }

  const topPerformers  = results?.employees.filter(e => ['top_performer','high_performer'].includes(e.classification)) || []
  const atRisk         = results?.employees.filter(e => ['at_risk','resignation_risk','needs_coaching'].includes(e.classification)) || []
  const summary        = results?.summary || {}

  return (
    <div className="max-w-6xl mx-auto px-4 pt-6">

      {/* Hero header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-4"
          style={{ background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.2)' }}>
          <div className="w-2 h-2 rounded-full bg-green-400" style={{ animation: 'pulse-ring 2s ease infinite' }} />
          <span className="text-xs font-medium tracking-widest uppercase" style={{ color: '#00D4FF', fontFamily: 'JetBrains Mono' }}>
            AI Engine Online
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold mb-2" style={{ color: '#E8F4FF' }}>
          Live Performance Analysis
        </h1>
        <p className="text-sm" style={{ color: '#4A7A9B' }}>
          Watch the AI score every employee in real time — attendance, tasks, sales, and feedback.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Left: terminal / control */}
        <div className="space-y-4">

          {/* Control panel */}
          <div className="glass-card rounded-xl p-4" style={{ border: '1px solid rgba(0,212,255,0.15)' }}>
            <div className="flex items-center gap-2 mb-4">
              <Brain size={16} style={{ color: '#00D4FF' }} />
              <span className="text-sm font-semibold" style={{ color: '#00D4FF' }}>AI Control Panel</span>
              <div className="ml-auto flex gap-2">
                {phase === 'idle' && (
                  <button onClick={runAnalysis}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all hover:scale-105 active:scale-95"
                    style={{ background: 'linear-gradient(135deg,#0080FF,#00D4FF)', color: '#fff' }}>
                    <Play size={13} /> Run Analysis
                  </button>
                )}
                {phase === 'running' && (
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                    <span className="text-xs" style={{ color: '#00D4FF' }}>Analyzing…</span>
                  </div>
                )}
                {phase === 'done' && (
                  <button onClick={reset}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all"
                    style={{ background: 'rgba(0,212,255,0.1)', color: '#00D4FF', border: '1px solid rgba(0,212,255,0.25)' }}>
                    <SkipForward size={12} /> Re-run
                  </button>
                )}
              </div>
            </div>

            {phase !== 'idle' && (
              <ProgressBar step={Math.min(step, AI_STEPS.length - 1)} />
            )}

            {phase === 'idle' && (
              <div className="text-center py-8">
                <div className="w-16 h-16 rounded-full mx-auto mb-3 flex items-center justify-center"
                  style={{ background: 'rgba(0,212,255,0.08)', border: '1px dashed rgba(0,212,255,0.2)' }}>
                  <Brain size={24} style={{ color: 'rgba(0,212,255,0.4)' }} />
                </div>
                <div className="text-sm" style={{ color: '#4A7A9B' }}>Click "Run Analysis" to start the AI engine</div>
              </div>
            )}
          </div>

          {/* Terminal log */}
          {logs.length > 0 && (
            <div className="glass-card rounded-xl overflow-hidden" style={{ border: '1px solid rgba(0,212,255,0.1)' }}>
              <div className="flex items-center gap-2 px-4 py-2 border-b" style={{ borderColor: 'rgba(0,212,255,0.1)' }}>
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500 opacity-70" />
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-500 opacity-70" />
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500 opacity-70" />
                </div>
                <span className="text-xs" style={{ color: '#4A7A9B', fontFamily: 'JetBrains Mono' }}>epi_engine.log</span>
              </div>
              <div ref={logsRef} className="p-4 space-y-1 overflow-y-auto" style={{ maxHeight: '240px' }}>
                {logs.map((l, i) => (
                  <LogLine key={l.id} text={l.text} type={l.type} delay={i * 20} />
                ))}
                {phase === 'running' && (
                  <div className="text-xs" style={{ color: '#00D4FF', fontFamily: 'JetBrains Mono' }}>
                    <span className="animate-blink">▊</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Summary stats */}
          {phase === 'done' && summary.total_employees && (
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Team Score',    value: summary.avg_score,     color: '#00D4FF', icon: Activity },
                { label: 'Top Talent',    value: `${summary.top_performers + summary.high_performers}/${summary.total_employees}`, color: '#00FF88', icon: Award },
                { label: 'Need Coaching', value: summary.needs_coaching, color: '#FFB800', icon: Users },
                { label: 'Resign Risk',   value: summary.resignation_risk, color: '#FF4444', icon: AlertTriangle },
              ].map(({ label, value, color, icon: Icon }) => (
                <div key={label} className="glass-card rounded-xl p-3 flex items-center gap-2 animate-fade-up"
                  style={{ border: `1px solid ${color}20` }}>
                  <Icon size={16} style={{ color, flexShrink: 0 }} />
                  <div>
                    <div className="font-bold" style={{ color, fontFamily: 'JetBrains Mono' }}>{value}</div>
                    <div className="text-xs" style={{ color: '#4A7A9B' }}>{label}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Live results */}
        <div className="space-y-4">

          {/* Top performers */}
          {topPerformers.length > 0 && (
            <div className="glass-card rounded-xl p-4" style={{ border: '1px solid rgba(0,255,136,0.15)' }}>
              <div className="flex items-center gap-2 mb-3">
                <Award size={14} style={{ color: '#00FF88' }} />
                <span className="text-xs font-semibold tracking-widest uppercase" style={{ color: '#00FF88' }}>
                  Top Performers
                </span>
              </div>
              <div className="space-y-2">
                {topPerformers.slice(0, empIndex < topPerformers.length ? empIndex + 1 : topPerformers.length).map((e, i) => (
                  <ResultCard key={e.employee_id} emp={e} delay={i * 60} onClick={onSelectEmployee} />
                ))}
              </div>
            </div>
          )}

          {/* At risk */}
          {atRisk.length > 0 && (
            <div className="glass-card rounded-xl p-4" style={{ border: '1px solid rgba(255,68,68,0.15)' }}>
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle size={14} style={{ color: '#FF4444' }} />
                <span className="text-xs font-semibold tracking-widest uppercase" style={{ color: '#FF4444' }}>
                  Requires Attention
                </span>
              </div>
              <div className="space-y-2">
                {atRisk.slice(0, empIndex < atRisk.length ? empIndex + 1 : atRisk.length).map((e, i) => (
                  <ResultCard key={e.employee_id} emp={e} delay={i * 60} onClick={onSelectEmployee} />
                ))}
              </div>
            </div>
          )}

          {phase === 'idle' && (
            <div className="glass-card rounded-xl p-8 text-center" style={{ border: '1px dashed rgba(0,212,255,0.1)' }}>
              <div className="text-sm" style={{ color: '#4A7A9B' }}>
                Results will appear here as the AI engine processes each employee profile.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function Activity({ size, style }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={style.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </svg>
  )
}
