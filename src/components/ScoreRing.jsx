import { useEffect, useState } from 'react'

export default function ScoreRing({ score, size = 80, strokeWidth = 6, color }) {
  const [displayed, setDisplayed] = useState(0)
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (displayed / 100) * circumference

  const autoColor = score >= 80 ? '#00FF88' : score >= 65 ? '#00D4FF' : score >= 50 ? '#0080FF' : score >= 35 ? '#FFB800' : '#FF4444'
  const ringColor = color || autoColor

  useEffect(() => {
    const timeout = setTimeout(() => setDisplayed(score), 100)
    return () => clearTimeout(timeout)
  }, [score])

  return (
    <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size/2} cy={size/2} r={radius} fill="none"
          stroke="rgba(255,255,255,0.05)" strokeWidth={strokeWidth} />
        <circle cx={size/2} cy={size/2} r={radius} fill="none"
          stroke={ringColor} strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(0.4,0,0.2,1)', filter: `drop-shadow(0 0 6px ${ringColor}88)` }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-bold leading-none" style={{
          fontSize: size * 0.22,
          color: ringColor,
          fontFamily: 'JetBrains Mono'
        }}>
          {Math.round(displayed)}
        </span>
        <span style={{ fontSize: size * 0.12, color: '#4A7A9B' }}>/ 100</span>
      </div>
    </div>
  )
}
