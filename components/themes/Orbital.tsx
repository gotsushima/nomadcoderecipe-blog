'use client'

import { useEffect, useRef } from 'react'

interface OrbitalProps {
  seed: number
  speedMultiplier: number
}

interface Orbit {
  cx: number
  cy: number
  rx: number
  ry: number
  tilt: number
  duration: number
  opacity: number
  strokeWidth: number
  hasDot: boolean
}

function generateOrbits(seed: number): Orbit[] {
  let s = seed
  const next = () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff
    return (s >>> 0) / 0xffffffff
  }

  const count = 4 + Math.floor(next() * 4)
  return Array.from({ length: count }, (_, i) => ({
    cx: 400 + (next() - 0.5) * 80,
    cy: 210 + (next() - 0.5) * 60,
    rx: 60 + i * 45 + next() * 30,
    ry: 30 + i * 22 + next() * 20,
    tilt: next() * 60 - 30,
    duration: 8 + i * 4 + next() * 8,
    opacity: 0.15 + next() * 0.4,
    strokeWidth: 0.5 + next() * 1.5,
    hasDot: next() > 0.5,
  }))
}

export function OrbitalTheme({ seed, speedMultiplier }: OrbitalProps) {
  const orbits = generateOrbits(seed)

  return (
    <div className="theme-header" aria-hidden="true">
      <svg
        viewBox="0 0 800 420"
        xmlns="http://www.w3.org/2000/svg"
        className="generative-canvas"
        style={{ opacity: 0.9 }}
      >
        <defs>
          <style>{`
            @keyframes orbit-spin {
              from { transform-origin: center; transform: rotate(0deg); }
              to   { transform-origin: center; transform: rotate(360deg); }
            }
          `}</style>
        </defs>

        {orbits.map((o, i) => (
          <g key={i} transform={`rotate(${o.tilt}, ${o.cx}, ${o.cy})`}>
            <ellipse
              cx={o.cx}
              cy={o.cy}
              rx={o.rx}
              ry={o.ry}
              fill="none"
              stroke="var(--color-primary)"
              strokeWidth={o.strokeWidth}
              opacity={o.opacity}
              style={{
                animation: `orbit-spin ${o.duration / speedMultiplier}s linear infinite`,
                transformOrigin: `${o.cx}px ${o.cy}px`,
              }}
            />
            {o.hasDot && (
              <circle
                cx={o.cx + o.rx}
                cy={o.cy}
                r={2 + o.strokeWidth}
                fill="var(--color-accent)"
                opacity={o.opacity + 0.3}
                style={{
                  animation: `orbit-spin ${o.duration / speedMultiplier}s linear infinite`,
                  transformOrigin: `${o.cx}px ${o.cy}px`,
                }}
              />
            )}
          </g>
        ))}

        {/* 中心点 */}
        <circle cx="400" cy="210" r="3" fill="var(--color-accent)" opacity="0.8" />
        <circle cx="400" cy="210" r="8" fill="none" stroke="var(--color-accent)" strokeWidth="0.5" opacity="0.4" />
      </svg>
    </div>
  )
}
