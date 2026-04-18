'use client'

import { useEffect, useRef } from 'react'

interface VoidProps {
  seed: number
  speedMultiplier: number
}

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  opacity: number
  hue: number
}

function createParticles(seed: number, count: number): Particle[] {
  let s = seed
  const next = () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff
    return (s >>> 0) / 0xffffffff
  }
  return Array.from({ length: count }, () => ({
    x: next() * 800,
    y: next() * 420,
    vx: (next() - 0.5) * 0.25,
    vy: (next() - 0.5) * 0.15,
    size: 0.5 + next() * 2.5,
    opacity: 0.2 + next() * 0.7,
    hue: next() * 60 - 30, // 本来の hue からの偏差
  }))
}

export function VoidTheme({ seed, speedMultiplier }: VoidProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rafRef = useRef<number | null>(null)
  const particlesRef = useRef<Particle[]>(createParticles(seed, 280))

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const W = canvas.width
    const H = canvas.height
    const particles = particlesRef.current

    const draw = () => {
      // トレイルエフェクト
      ctx.fillStyle = 'rgba(5, 3, 15, 0.12)'
      ctx.fillRect(0, 0, W, H)

      for (const p of particles) {
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fillStyle = `oklch(${75 + p.hue * 0.2}% 0.15 ${220 + p.hue})`
        ctx.globalAlpha = p.opacity
        ctx.fill()

        p.x += p.vx * speedMultiplier
        p.y += p.vy * speedMultiplier

        // 境界折り返し
        if (p.x < 0) p.x = W
        if (p.x > W) p.x = 0
        if (p.y < 0) p.y = H
        if (p.y > H) p.y = 0
      }
      ctx.globalAlpha = 1
      rafRef.current = requestAnimationFrame(draw)
    }

    rafRef.current = requestAnimationFrame(draw)
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
    }
  }, [seed, speedMultiplier])

  return (
    <div className="theme-header" aria-hidden="true">
      <canvas
        ref={canvasRef}
        width={800}
        height={420}
        className="generative-canvas"
      />
    </div>
  )
}
