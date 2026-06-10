import { Brain, BarChart2, Zap, RefreshCw, ChevronLeft } from 'lucide-react'
import { useState } from 'react'

export default function Header({ view, setView, lastRefresh, onRefresh }) {
  const [spinning, setSpinning] = useState(false)

  const handleRefresh = async () => {
    setSpinning(true)
    await onRefresh()
    setTimeout(() => setSpinning(false), 600)
  }

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart2 },
    { id: 'live',      label: 'Live AI',   icon: Zap },
  ]

  return (
    <header style={{ borderBottom: '1px solid rgba(0,212,255,0.1)' }}
      className="sticky top-0 z-50 glass-card">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-3">

        {/* Logo */}
        <div className="flex items-center gap-2 min-w-0">
          <div className="relative flex-shrink-0">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg,#0080FF,#00D4FF)' }}>
              <Brain size={16} color="#fff" />
            </div>
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-green-400"
              style={{ animation: 'pulse-ring 2s ease infinite' }} />
          </div>
          <div className="hidden sm:block">
            <div className="font-bold text-sm tracking-widest" style={{ color: '#00D4FF', fontFamily: 'JetBrains Mono' }}>EPI</div>
            <div className="text-xs" style={{ color: '#4A7A9B' }}>Performance Intelligence</div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex gap-1">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => setView(item.id)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200"
              style={{
                background: view === item.id ? 'rgba(0,212,255,0.15)' : 'transparent',
                color: view === item.id ? '#00D4FF' : '#4A7A9B',
                border: view === item.id ? '1px solid rgba(0,212,255,0.3)' : '1px solid transparent',
              }}
            >
              <item.icon size={13} />
              <span className="hidden sm:inline">{item.label}</span>
            </button>
          ))}
        </nav>

        {/* Right */}
        <div className="flex items-center gap-2">
          {lastRefresh && (
            <span className="hidden md:block text-xs" style={{ color: '#4A7A9B', fontFamily: 'JetBrains Mono' }}>
              {lastRefresh.toLocaleTimeString()}
            </span>
          )}
          <button
            onClick={handleRefresh}
            className="p-1.5 rounded-lg transition-colors"
            style={{ color: '#4A7A9B' }}
            title="Refresh data"
          >
            <RefreshCw size={14} style={{ animation: spinning ? 'spin 0.6s linear' : 'none' }} />
          </button>
        </div>
      </div>
    </header>
  )
}
