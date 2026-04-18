'use client'

import { useEffect, useRef } from 'react'

interface ParticleFieldProps {
  seed?: number
  speedMultiplier?: number
  opacity?: number
}

// Reproducible LCG random number generator (same pattern as existing themes)
function makeLcg(seed: number) {
  let s = seed >>> 0
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0
    return s / 0x100000000
  }
}

// Time-varying flow field angle at (x, y, t)
// Multiple sinusoidal octaves create organic, vortex-like structure
function flowAngle(x: number, y: number, t: number, w: number, h: number): number {
  const nx = x / w
  const ny = y / h
  return (
    Math.sin(nx * 4.2 + t * 0.30) * Math.cos(ny * 3.7 + t * 0.20) * Math.PI * 2 +
    Math.sin(nx * 8.1 - t * 0.15 + ny * 2.3) * 0.55 +
    Math.cos(ny * 6.4 + t * 0.25 - nx * 1.7) * 0.30
  )
}

interface Particle {
  x: number
  y: number
  px: number
  py: number
  vx: number
  vy: number
  life: number
  maxLife: number
  color: string
  size: number
}

export function ParticleField({
  seed = 42,
  speedMultiplier = 1,
  opacity = 0.5,
}: ParticleFieldProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    // Resolve CSS custom property colors (OKLCH is supported in canvas on modern browsers)
    const rootStyle = getComputedStyle(document.documentElement)
    const primary   = rootStyle.getPropertyValue('--color-primary').trim()
    const secondary = rootStyle.getPropertyValue('--color-secondary').trim()
    const accent    = rootStyle.getPropertyValue('--color-accent').trim()
    const colors    = [primary, secondary, accent]

    const PARTICLE_COUNT = prefersReduced ? 0 : 700

    let w = window.innerWidth
    let h = window.innerHeight

    const resize = () => {
      w = window.innerWidth
      h = window.innerHeight
      canvas.width  = w
      canvas.height = h
    }
    resize()
    window.addEventListener('resize', resize)

    const rand = makeLcg(seed)

    // Initialize particles with staggered life so they don't all spawn at once
    const particles: Particle[] = Array.from({ length: PARTICLE_COUNT }, () => {
      const maxLife = 100 + rand() * 140
      return {
        x:       rand() * w,
        y:       rand() * h,
        px:      0,
        py:      0,
        vx:      0,
        vy:      0,
        life:    rand() * maxLife,   // stagger starting life
        maxLife,
        color:   colors[Math.floor(rand() * 3)] ?? primary,
        size:    0.4 + rand() * 1.2,
      }
    })

    // ── Reduced-motion: render a single static snapshot ──────────────────────
    if (prefersReduced) {
      const staticRand = makeLcg(seed)
      const lineCount  = 200
      for (let i = 0; i < lineCount; i++) {
        const x     = staticRand() * w
        const y     = staticRand() * h
        const angle = flowAngle(x, y, 0, w, h)
        const len   = 20 + staticRand() * 30
        ctx.beginPath()
        ctx.moveTo(x, y)
        ctx.lineTo(x + Math.cos(angle) * len, y + Math.sin(angle) * len)
        ctx.strokeStyle = colors[Math.floor(staticRand() * 3)] ?? primary
        ctx.globalAlpha = 0.06
        ctx.lineWidth   = 0.5
        ctx.stroke()
      }
      return () => window.removeEventListener('resize', resize)
    }

    // ── Animated loop ─────────────────────────────────────────────────────────
    // Capture as non-null to satisfy TypeScript inside the tick closure
    const c = ctx as CanvasRenderingContext2D

    let t     = 0
    let animId: number

    function tick() {
      // Soft erase: approximate --color-bg (oklch 8% ≈ very dark)
      c.fillStyle = 'rgba(6, 5, 14, 0.06)'
      c.fillRect(0, 0, w, h)

      const speed = 1.4 * speedMultiplier

      for (const p of particles) {
        p.px = p.x
        p.py = p.y

        const angle = flowAngle(p.x, p.y, t, w, h)
        // Exponential smoothing on velocity for organic momentum
        p.vx = p.vx * 0.88 + Math.cos(angle) * speed * 0.35
        p.vy = p.vy * 0.88 + Math.sin(angle) * speed * 0.35
        p.x += p.vx
        p.y += p.vy
        p.life++

        // Bell-curve alpha: fade in then fade out over particle lifetime
        const progress = p.life / p.maxLife
        const alpha    = Math.sin(progress * Math.PI) * 0.65

        c.beginPath()
        c.moveTo(p.px, p.py)
        c.lineTo(p.x, p.y)
        c.strokeStyle = p.color
        c.globalAlpha = alpha
        c.lineWidth   = p.size
        c.lineCap     = 'round'
        c.stroke()

        // Respawn when expired or out of bounds
        if (
          p.life >= p.maxLife ||
          p.x < -10 || p.x > w + 10 ||
          p.y < -10 || p.y > h + 10
        ) {
          p.x       = rand() * w
          p.y       = rand() * h
          p.px      = p.x
          p.py      = p.y
          p.vx      = 0
          p.vy      = 0
          p.life    = 0
          p.maxLife = 100 + rand() * 140
          p.color   = colors[Math.floor(rand() * 3)] ?? primary
        }
      }

      c.globalAlpha = 1
      t       += 0.004 * speedMultiplier
      animId   = requestAnimationFrame(tick)
    }

    animId = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', resize)
    }
  }, [seed, speedMultiplier])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position:      'fixed',
        inset:         0,
        width:         '100%',
        height:        '100%',
        pointerEvents: 'none',
        zIndex:        0,
        opacity,
      }}
      aria-hidden="true"
    />
  )
}
