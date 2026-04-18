'use client'

interface GlyphProps {
  seed: number
  speedMultiplier: number
  title: string
}

interface GlyphChar {
  char: string
  x: number
  y: number
  size: number
  opacity: number
  duration: number
  delay: number
  color: string
}

const GLYPH_POOL = '01αβγδεζΣΩ∞∂∇∈∉⊂⊃∩∪≈≠≡∀∃⟨⟩◆◇○●▲△□■'

function generateGlyphs(seed: number, title: string): GlyphChar[] {
  let s = seed
  const next = () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff
    return (s >>> 0) / 0xffffffff
  }

  const glyphs: GlyphChar[] = []
  const count = 12 + Math.floor(next() * 10)

  for (let i = 0; i < count; i++) {
    // タイトルの文字と記号をミックス
    const useTitle = next() > 0.5 && title.length > 0
    const char = useTitle
      ? (title[Math.floor(next() * title.length)] ?? '◆')
      : (GLYPH_POOL[Math.floor(next() * GLYPH_POOL.length)] ?? '◆')

    glyphs.push({
      char,
      x: next() * 780,
      y: 30 + next() * 360,
      size: 12 + next() * 80,
      opacity: 0.05 + next() * 0.25,
      duration: 4 + next() * 8,
      delay: next() * -6,
      color:
        next() > 0.8
          ? 'var(--color-accent)'
          : next() > 0.5
            ? 'var(--color-primary)'
            : 'var(--color-secondary)',
    })
  }
  return glyphs
}

export function GlyphTheme({ seed, speedMultiplier, title }: GlyphProps) {
  const glyphs = generateGlyphs(seed, title)

  return (
    <div className="theme-header" aria-hidden="true">
      <svg viewBox="0 0 800 420" xmlns="http://www.w3.org/2000/svg" className="generative-canvas">
        <defs>
          <style>{`
            @keyframes glyph-float {
              0%, 100% { transform: translateY(0) rotate(0deg); }
              33%       { transform: translateY(-8px) rotate(3deg); }
              66%       { transform: translateY(5px) rotate(-2deg); }
            }
            @keyframes glyph-pulse {
              0%, 100% { opacity: var(--g-op); }
              50%       { opacity: calc(var(--g-op) * 0.3); }
            }
          `}</style>
        </defs>

        {glyphs.map((g, i) => (
          <text
            key={i}
            x={g.x}
            y={g.y}
            fontSize={g.size}
            fill={g.color}
            fontFamily="IBM Plex Mono, monospace"
            style={
              {
                '--g-op': g.opacity,
                opacity: g.opacity,
                transformOrigin: `${g.x}px ${g.y}px`,
                animation: [
                  `glyph-float ${g.duration / speedMultiplier}s ${g.delay}s ease-in-out infinite`,
                  `glyph-pulse ${(g.duration * 1.3) / speedMultiplier}s ${g.delay * 0.5}s ease-in-out infinite`,
                ].join(', '),
              } as React.CSSProperties
            }
          >
            {g.char}
          </text>
        ))}
      </svg>
    </div>
  )
}
