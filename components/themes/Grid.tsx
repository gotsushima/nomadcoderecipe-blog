'use client'

interface GridProps {
  seed: number
  speedMultiplier: number
}

interface Cell {
  x: number
  y: number
  delay: number
  color: string
  size: number
}

function generateCells(seed: number): Cell[] {
  let s = seed
  const next = () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff
    return (s >>> 0) / 0xffffffff
  }

  const cols = 20
  const rows = 10
  const cellW = 800 / cols
  const cellH = 420 / rows

  const cells: Cell[] = []
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (next() > 0.45) continue // 一部のセルのみ表示
      const waveDelay = (c / cols + r / rows) * 1.2
      cells.push({
        x: c * cellW,
        y: r * cellH,
        delay: waveDelay + next() * 0.2,
        color:
          next() > 0.85
            ? 'var(--color-accent)'
            : next() > 0.5
              ? 'var(--color-primary)'
              : 'var(--color-secondary)',
        size: Math.min(cellW, cellH) * (0.3 + next() * 0.55),
      })
    }
  }
  return cells
}

export function GridTheme({ seed, speedMultiplier }: GridProps) {
  const cells = generateCells(seed)
  const totalDuration = 2.5 / speedMultiplier
  const loopDuration = totalDuration + 1.5

  return (
    <div className="theme-header" aria-hidden="true">
      <svg viewBox="0 0 800 420" xmlns="http://www.w3.org/2000/svg" className="generative-canvas">
        <defs>
          <style>{`
            @keyframes cell-in {
              0%   { opacity: 0; transform: scale(0.2); }
              60%  { opacity: 1; transform: scale(1); }
              80%  { opacity: 1; transform: scale(1); }
              100% { opacity: 0; transform: scale(0.2); }
            }
          `}</style>
        </defs>

        {cells.map((cell, i) => (
          <rect
            key={i}
            x={cell.x + (40 - cell.size) / 2}
            y={cell.y + (42 - cell.size) / 2}
            width={cell.size}
            height={cell.size}
            fill={cell.color}
            opacity={0}
            rx={cell.size * 0.15}
            style={{
              transformOrigin: `${cell.x + 20}px ${cell.y + 21}px`,
              animation: `cell-in ${loopDuration}s ${cell.delay}s ease-in-out infinite`,
            }}
          />
        ))}
      </svg>
    </div>
  )
}
