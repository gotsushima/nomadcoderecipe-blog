"use client"

import { useEffect, useRef } from "react"

export function NotoCursor() {
  const dotRef = useRef<HTMLDivElement>(null)
  const ringRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (typeof window === "undefined") return
    if (window.matchMedia("(pointer: coarse)").matches) return

    document.body.style.cursor = "none"

    let mx = 0, my = 0, rx = 0, ry = 0
    let raf: number

    const onMove = (e: MouseEvent) => {
      mx = e.clientX
      my = e.clientY
      if (dotRef.current) {
        dotRef.current.style.left = mx + "px"
        dotRef.current.style.top = my + "px"
      }
    }

    const animRing = () => {
      rx += (mx - rx) * 0.12
      ry += (my - ry) * 0.12
      if (ringRef.current) {
        ringRef.current.style.left = rx + "px"
        ringRef.current.style.top = ry + "px"
      }
      raf = requestAnimationFrame(animRing)
    }
    raf = requestAnimationFrame(animRing)

    document.addEventListener("mousemove", onMove)

    const onOver = (e: MouseEvent) => {
      const el = (e.target as Element)?.closest("a, button, .post-card, .list-item")
      if (el) dotRef.current?.classList.add("hovering")
      else dotRef.current?.classList.remove("hovering")
    }
    document.addEventListener("mouseover", onOver)

    return () => {
      document.removeEventListener("mousemove", onMove)
      document.removeEventListener("mouseover", onOver)
      cancelAnimationFrame(raf)
      document.body.style.cursor = ""
    }
  }, [])

  return (
    <>
      <div ref={dotRef} id="cursor" />
      <div ref={ringRef} id="cursor-ring" />
    </>
  )
}
