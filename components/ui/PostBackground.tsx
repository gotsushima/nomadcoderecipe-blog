'use client'

import { useEffect, useRef } from 'react'

interface PostBackgroundProps {
  seed?: number
  speedMultiplier?: number
}

function makeLcg(seed: number) {
  let s = seed >>> 0
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0
    return s / 0x100000000
  }
}

// ─── Variant 0: Nebula ────────────────────────────────────────────────────────
// Overlapping translucent radial gradient orbs that drift slowly — aurora-like
function makeNebula(seed: number) {
  const rand = makeLcg(seed)
  return Array.from({ length: 7 }, () => ({
    bx: rand(),
    by: rand(),
    rFrac: 0.28 + rand() * 0.45,
    phaseX: rand() * Math.PI * 2,
    phaseY: rand() * Math.PI * 2,
    speedX: 0.10 + rand() * 0.18,
    speedY: 0.08 + rand() * 0.15,
    rangeX: 0.07 + rand() * 0.06,
    rangeY: 0.06 + rand() * 0.08,
    colorIdx: Math.floor(rand() * 3) as 0 | 1 | 2,
  }))
}

// ─── Variant 1: Constellation ─────────────────────────────────────────────────
// Slowly drifting stars connected by thin lines when nearby
function makeStars(seed: number) {
  const rand = makeLcg(seed)
  return Array.from({ length: 110 }, () => ({
    x: rand(),
    y: rand(),
    r: 0.6 + rand() * 1.8,
    phase: rand() * Math.PI * 2,
    twinkleSpeed: 0.4 + rand() * 1.4,
    vx: (rand() - 0.5) * 0.00012,
    vy: (rand() - 0.5) * 0.00012,
    colorIdx: Math.floor(rand() * 3) as 0 | 1 | 2,
  }))
}

// ─── Variant 2: Aurora ───────────────────────────────────────────────────────
// Horizontal sine-wave light bands that slowly undulate
function makeAurora(seed: number) {
  const rand = makeLcg(seed ^ 0xdeadbeef)
  return Array.from({ length: 5 }, (_, i) => ({
    yFrac: 0.12 + i * 0.17 + rand() * 0.04,
    hFrac: 0.055 + rand() * 0.055,
    freq: 0.003 + rand() * 0.004,
    phase: rand() * Math.PI * 2,
    drift: 0.28 + rand() * 0.38,
    colorIdx: Math.floor(rand() * 3) as 0 | 1 | 2,
    alpha: 0.045 + rand() * 0.05,
  }))
}

// ─── Variant 3: Prism ────────────────────────────────────────────────────────
// Moving light-source nodes composited in screen mode — lens-flare glow
function makePrism(seed: number) {
  const rand = makeLcg(seed ^ 0xcafebabe)
  return Array.from({ length: 5 }, () => ({
    phaseX: rand() * Math.PI * 2,
    phaseY: rand() * Math.PI * 2,
    speedX: 0.22 + rand() * 0.42,
    speedY: 0.18 + rand() * 0.36,
    rFrac: 0.35 + rand() * 0.30,
    colorIdx: Math.floor(rand() * 3) as 0 | 1 | 2,
  }))
}

export function PostBackground({ seed = 42, speedMultiplier = 1 }: PostBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const variant = seed % 4

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const rootStyle = getComputedStyle(document.documentElement)
    const primary   = rootStyle.getPropertyValue('--color-primary').trim()
    const secondary = rootStyle.getPropertyValue('--color-secondary').trim()
    const accent    = rootStyle.getPropertyValue('--color-accent').trim()
    const colors: [string, string, string] = [primary, secondary, accent]

    let w = 0
    let h = 0

    const resize = () => {
      const rect = canvas.getBoundingClientRect()
      w = rect.width  || window.innerWidth
      h = rect.height || window.innerHeight
      canvas.width  = w
      canvas.height = h
    }
    resize()

    const ro = new ResizeObserver(resize)
    ro.observe(canvas)

    // Pre-build data
    const nebula  = makeNebula(seed)
    const stars   = makeStars(seed)
    const aurora  = makeAurora(seed)
    const prism   = makePrism(seed)

    let t = 0
    let animId: number

    // ── Tick: Nebula ─────────────────────────────────────────────────────────
    function tickNebula() {
      ctx.clearRect(0, 0, w, h)
      for (const b of nebula) {
        const r = Math.min(w, h) * b.rFrac
        const x = b.bx * w + Math.sin(t * b.speedX + b.phaseX) * b.rangeX * w
        const y = b.by * h + Math.cos(t * b.speedY + b.phaseY) * b.rangeY * h
        const grad = ctx.createRadialGradient(x, y, 0, x, y, r)
        grad.addColorStop(0,   colors[b.colorIdx])
        grad.addColorStop(0.35, colors[b.colorIdx])
        grad.addColorStop(1,   'transparent')
        ctx.globalAlpha = 0.09
        ctx.fillStyle   = grad
        ctx.fillRect(0, 0, w, h)
      }
      ctx.globalAlpha = 1
    }

    // ── Tick: Constellation ──────────────────────────────────────────────────
    function tickConstellation() {
      ctx.clearRect(0, 0, w, h)

      for (const s of stars) {
        s.x = (s.x + s.vx + 1) % 1
        s.y = (s.y + s.vy + 1) % 1
      }

      const threshold = Math.min(w, h) * 0.17
      const threshSq  = threshold * threshold

      ctx.lineWidth = 0.5
      for (let i = 0; i < stars.length; i++) {
        for (let j = i + 1; j < stars.length; j++) {
          const dx = (stars[i].x - stars[j].x) * w
          const dy = (stars[i].y - stars[j].y) * h
          const dSq = dx * dx + dy * dy
          if (dSq < threshSq) {
            ctx.beginPath()
            ctx.moveTo(stars[i].x * w, stars[i].y * h)
            ctx.lineTo(stars[j].x * w, stars[j].y * h)
            ctx.strokeStyle = colors[stars[i].colorIdx]
            ctx.globalAlpha = (1 - dSq / threshSq) * 0.22
            ctx.stroke()
          }
        }
      }

      for (const s of stars) {
        const twinkle = 0.5 + 0.5 * Math.sin(t * s.twinkleSpeed + s.phase)
        ctx.beginPath()
        ctx.arc(s.x * w, s.y * h, s.r, 0, Math.PI * 2)
        ctx.fillStyle   = colors[s.colorIdx]
        ctx.globalAlpha = 0.25 + twinkle * 0.75
        ctx.fill()
      }

      ctx.globalAlpha = 1
    }

    // ── Tick: Aurora ─────────────────────────────────────────────────────────
    function tickAurora() {
      ctx.clearRect(0, 0, w, h)

      for (const band of aurora) {
        const cy = band.yFrac * h
        const bh = band.hFrac * h
        const steps = 60

        ctx.beginPath()
        ctx.moveTo(0, cy + bh)

        for (let i = 0; i <= steps; i++) {
          const x  = (i / steps) * w
          const w1 = Math.sin(x * band.freq + t * band.drift + band.phase)
          const w2 = Math.sin(x * band.freq * 2.5 - t * band.drift * 0.55 + band.phase * 1.7)
          ctx.lineTo(x, cy + (w1 * 0.65 + w2 * 0.35) * bh - bh)
        }
        for (let i = steps; i >= 0; i--) {
          const x  = (i / steps) * w
          const w1 = Math.sin(x * band.freq + t * band.drift + band.phase)
          const w2 = Math.sin(x * band.freq * 2.5 - t * band.drift * 0.55 + band.phase * 1.7)
          ctx.lineTo(x, cy + (w1 * 0.65 + w2 * 0.35) * bh + bh)
        }
        ctx.closePath()

        const grad = ctx.createLinearGradient(0, cy - bh * 2, 0, cy + bh * 2)
        grad.addColorStop(0,   'transparent')
        grad.addColorStop(0.5, colors[band.colorIdx])
        grad.addColorStop(1,   'transparent')

        ctx.fillStyle   = grad
        ctx.globalAlpha = band.alpha * (0.65 + 0.35 * Math.sin(t * 0.45 + band.phase))
        ctx.fill()
      }

      ctx.globalAlpha = 1
    }

    // ── Tick: Prism ──────────────────────────────────────────────────────────
    function tickPrism() {
      ctx.clearRect(0, 0, w, h)
      ctx.globalCompositeOperation = 'screen'

      for (const node of prism) {
        const cx = (0.5 + 0.42 * Math.sin(t * node.speedX + node.phaseX)) * w
        const cy = (0.5 + 0.42 * Math.cos(t * node.speedY + node.phaseY)) * h
        const r  = Math.min(w, h) * node.rFrac

        const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r)
        grad.addColorStop(0,   colors[node.colorIdx])
        grad.addColorStop(0.3, colors[node.colorIdx])
        grad.addColorStop(1,   'transparent')

        ctx.globalAlpha = 0.065
        ctx.fillStyle   = grad
        ctx.fillRect(0, 0, w, h)
      }

      ctx.globalCompositeOperation = 'source-over'
      ctx.globalAlpha = 1
    }

    function drawFrame() {
      switch (variant) {
        case 0: tickNebula();        break
        case 1: tickConstellation(); break
        case 2: tickAurora();        break
        default: tickPrism();        break
      }
    }

    if (prefersReduced) {
      drawFrame()
      return () => ro.disconnect()
    }

    function tick() {
      drawFrame()
      t      += 0.006 * speedMultiplier
      animId  = requestAnimationFrame(tick)
    }

    animId = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(animId)
      ro.disconnect()
    }
  }, [seed, speedMultiplier, variant])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position:      'absolute',
        inset:         0,
        width:         '100%',
        height:        '100%',
        pointerEvents: 'none',
      }}
      aria-hidden="true"
    />
  )
}
