'use client'

interface WaveProps {
  seed: number
  speedMultiplier: number
}

interface WaveLayer {
  amplitude: number
  frequency: number
  phase: number
  duration: number
  opacity: number
  strokeWidth: number
  yBase: number
}

function generateWaveLayers(seed: number): WaveLayer[] {
  let s = seed
  const next = () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff
    return (s >>> 0) / 0xffffffff
  }

  return Array.from({ length: 5 }, (_, i) => ({
    amplitude: 20 + next() * 40,
    frequency: 1.5 + next() * 2,
    phase: next() * Math.PI * 2,
    duration: 4 + i * 1.5 + next() * 3,
    opacity: 0.1 + (4 - i) * 0.07,
    strokeWidth: 1 + (4 - i) * 0.5,
    yBase: 100 + i * 60 + next() * 20,
  }))
}

function buildWavePath(layer: WaveLayer, width = 800): string {
  const points: string[] = []
  const steps = 120
  for (let j = 0; j <= steps; j++) {
    const x = (j / steps) * width
    const y = layer.yBase + Math.sin((j / steps) * Math.PI * 2 * layer.frequency + layer.phase) * layer.amplitude
    points.push(j === 0 ? `M ${x},${y}` : `L ${x},${y}`)
  }
  return points.join(' ')
}

export function WaveTheme({ seed, speedMultiplier }: WaveProps) {
  const layers = generateWaveLayers(seed)

  return (
    <div className="theme-header" aria-hidden="true">
      <svg viewBox="0 0 800 420" xmlns="http://www.w3.org/2000/svg" className="generative-canvas">
        <defs>
          {layers.map((layer, i) => (
            <style key={i}>{`
              @keyframes wave-float-${i} {
                0%   { transform: translateX(0); }
                50%  { transform: translateX(-${20 + i * 8}px); }
                100% { transform: translateX(0); }
              }
            `}</style>
          ))}
        </defs>

        {layers.map((layer, i) => (
          <path
            key={i}
            d={buildWavePath(layer)}
            fill="none"
            stroke={i % 2 === 0 ? 'var(--color-primary)' : 'var(--color-secondary)'}
            strokeWidth={layer.strokeWidth}
            opacity={layer.opacity}
            style={{
              animation: `wave-float-${i} ${layer.duration / speedMultiplier}s ease-in-out infinite`,
            }}
          />
        ))}
      </svg>
    </div>
  )
}
