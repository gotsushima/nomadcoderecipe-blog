'use client'

import { useEffect, useRef } from 'react'

interface FlowProps {
  seed: number
  speedMultiplier: number
}

interface FlowPath {
  d: string
  length: number
  duration: number
  delay: number
  strokeWidth: number
  opacity: number
  color: string
}

function cubicBezierPath(seed: number, index: number): string {
  let s = seed + index * 997
  const next = () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff
    return (s >>> 0) / 0xffffffff
  }
  const x0 = next() * 200
  const y0 = 100 + next() * 220
  const cx1 = 100 + next() * 600
  const cy1 = 20 + next() * 380
  const cx2 = 100 + next() * 600
  const cy2 = 20 + next() * 380
  const x1 = 600 + next() * 200
  const y1 = 100 + next() * 220
  return `M ${x0},${y0} C ${cx1},${cy1} ${cx2},${cy2} ${x1},${y1}`
}

function generateFlowPaths(seed: number): FlowPath[] {
  let s = seed
  const next = () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff
    return (s >>> 0) / 0xffffffff
  }
  const count = 5 + Math.floor(next() * 4)
  return Array.from({ length: count }, (_, i) => ({
    d: cubicBezierPath(seed, i),
    length: 800 + next() * 400,
    duration: 2.5 + next() * 3,
    delay: i * 0.4 * next(),
    strokeWidth: 0.8 + next() * 2.5,
    opacity: 0.3 + next() * 0.5,
    color: i % 3 === 0 ? 'var(--color-accent)' : i % 3 === 1 ? 'var(--color-primary)' : 'var(--color-secondary)',
  }))
}

export function FlowTheme({ seed, speedMultiplier }: FlowProps) {
  const paths = generateFlowPaths(seed)

  return (
    <div className="theme-header" aria-hidden="true">
      <svg viewBox="0 0 800 420" xmlns="http://www.w3.org/2000/svg" className="generative-canvas">
        <defs>
          {paths.map((p, i) => (
            <style key={i}>{`
              @keyframes draw-${i} {
                0%   { stroke-dashoffset: ${p.length}; }
                60%  { stroke-dashoffset: 0; }
                100% { stroke-dashoffset: 0; }
              }
              @keyframes fade-${i} {
                0%   { opacity: 0; }
                10%  { opacity: ${p.opacity}; }
                85%  { opacity: ${p.opacity}; }
                100% { opacity: 0; }
              }
            `}</style>
          ))}
        </defs>

        {paths.map((p, i) => (
          <path
            key={i}
            d={p.d}
            fill="none"
            stroke={p.color}
            strokeWidth={p.strokeWidth}
            strokeDasharray={p.length}
            strokeLinecap="round"
            style={{
              animation: [
                `draw-${i} ${p.duration / speedMultiplier}s ${p.delay}s ease-out infinite`,
                `fade-${i} ${p.duration / speedMultiplier}s ${p.delay}s ease-in-out infinite`,
              ].join(', '),
            }}
          />
        ))}
      </svg>
    </div>
  )
}
