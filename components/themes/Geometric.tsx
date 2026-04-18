'use client'

interface GeometricProps {
  seed: number
  speedMultiplier: number
}

interface Shape {
  x: number
  y: number
  size: number
  sides: number
  rotation: number
  duration: number
  delay: number
  opacity: number
  filled: boolean
}

function polygon(cx: number, cy: number, r: number, sides: number, rotation: number): string {
  return Array.from({ length: sides }, (_, i) => {
    const angle = (i / sides) * Math.PI * 2 + rotation
    const x = cx + Math.cos(angle) * r
    const y = cy + Math.sin(angle) * r
    return `${i === 0 ? 'M' : 'L'} ${x.toFixed(2)},${y.toFixed(2)}`
  }).join(' ') + ' Z'
}

function generateShapes(seed: number): Shape[] {
  let s = seed
  const next = () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff
    return (s >>> 0) / 0xffffffff
  }

  return Array.from({ length: 8 }, () => ({
    x: 80 + next() * 640,
    y: 40 + next() * 340,
    size: 20 + next() * 80,
    sides: 3 + Math.floor(next() * 5), // 三角〜七角形
    rotation: next() * Math.PI,
    duration: 6 + next() * 12,
    delay: next() * -8,
    opacity: 0.1 + next() * 0.3,
    filled: next() > 0.6,
  }))
}

export function GeometricTheme({ seed, speedMultiplier }: GeometricProps) {
  const shapes = generateShapes(seed)

  return (
    <div className="theme-header" aria-hidden="true">
      <svg viewBox="0 0 800 420" xmlns="http://www.w3.org/2000/svg" className="generative-canvas">
        <defs>
          <style>{`
            @keyframes geo-spin {
              0%   { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
            @keyframes geo-morph {
              0%, 100% { transform: scale(1) rotate(0deg); }
              50%       { transform: scale(0.85) rotate(180deg); }
            }
          `}</style>
        </defs>

        {shapes.map((s, i) => (
          <path
            key={i}
            d={polygon(s.x, s.y, s.size, s.sides, s.rotation)}
            fill={s.filled ? 'var(--color-primary)' : 'none'}
            stroke="var(--color-primary)"
            strokeWidth={s.filled ? 0 : 1}
            opacity={s.opacity}
            style={{
              transformOrigin: `${s.x}px ${s.y}px`,
              animation: `${i % 2 === 0 ? 'geo-spin' : 'geo-morph'} ${s.duration / speedMultiplier}s linear ${s.delay}s infinite`,
            }}
          />
        ))}

        {/* グリッド線 */}
        {Array.from({ length: 8 }, (_, i) => (
          <line
            key={`h${i}`}
            x1="0" y1={i * 60} x2="800" y2={i * 60}
            stroke="var(--color-primary)" strokeWidth="0.3" opacity="0.08"
          />
        ))}
        {Array.from({ length: 14 }, (_, i) => (
          <line
            key={`v${i}`}
            x1={i * 60} y1="0" x2={i * 60} y2="420"
            stroke="var(--color-primary)" strokeWidth="0.3" opacity="0.08"
          />
        ))}
      </svg>
    </div>
  )
}
