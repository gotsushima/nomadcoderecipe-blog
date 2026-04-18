'use client'

import { useEffect, useRef } from 'react'

interface NoiseProps {
  seed: number
  speedMultiplier: number
}

// Simplex-like noise (依存ゼロ、純粋実装)
function fade(t: number) { return t * t * t * (t * (t * 6 - 15) + 10) }
function lerp(a: number, b: number, t: number) { return a + t * (b - a) }

function grad(hash: number, x: number, y: number): number {
  const h = hash & 3
  const u = h < 2 ? x : y
  const v = h < 2 ? y : x
  return ((h & 1) ? -u : u) + ((h & 2) ? -v : v)
}

function noise2d(px: number[], x: number, y: number): number {
  const X = Math.floor(x) & 255
  const Y = Math.floor(y) & 255
  x -= Math.floor(x)
  y -= Math.floor(y)
  const u = fade(x)
  const v = fade(y)
  const a = (px[X] ?? 0) + Y
  const b = (px[X + 1] ?? 0) + Y
  return lerp(
    lerp(grad(px[a] ?? 0, x, y), grad(px[b] ?? 0, x - 1, y), u),
    lerp(grad(px[a + 1] ?? 0, x, y - 1), grad(px[b + 1] ?? 0, x - 1, y - 1), u),
    v,
  )
}

function buildPermutation(seed: number): number[] {
  const p = Array.from({ length: 256 }, (_, i) => i)
  let s = seed
  for (let i = 255; i > 0; i--) {
    s = (s * 1664525 + 1013904223) & 0xffffffff
    const j = (s >>> 0) % (i + 1)
    ;[p[i], p[j]] = [p[j] ?? i, p[i] ?? j]
  }
  return [...p, ...p]
}

export function NoiseTheme({ seed, speedMultiplier }: NoiseProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rafRef = useRef<number | null>(null)
  const perm = useRef(buildPermutation(seed))

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const W = canvas.width
    const H = canvas.height
    const px = perm.current
    let t = 0

    const draw = () => {
      const imageData = ctx.createImageData(W, H)
      const data = imageData.data
      const scale = 0.004
      const timeScale = 0.0003 * speedMultiplier

      for (let y = 0; y < H; y++) {
        for (let x = 0; x < W; x++) {
          const n =
            noise2d(px, x * scale + t * timeScale, y * scale) * 0.6 +
            noise2d(px, x * scale * 2 - t * timeScale * 0.5, y * scale * 2) * 0.3 +
            noise2d(px, x * scale * 4, y * scale * 4 + t * timeScale * 0.3) * 0.1

          const v = Math.floor(((n + 1) / 2) * 255)
          const idx = (y * W + x) * 4
          data[idx] = v * 0.6          // R (抑えて紫みに)
          data[idx + 1] = v * 0.2      // G
          data[idx + 2] = v            // B
          data[idx + 3] = 200          // A
        }
      }
      ctx.putImageData(imageData, 0, 0)
      t++
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
        style={{ opacity: 0.75 }}
      />
    </div>
  )
}
