"use client"

import Link from "next/link"
import { useEffect, useRef } from "react"

const tickerItems = [
  "Nomad Code Recipe",
  "AI × Engineering",
  "試して、捨てて",
  "残した判断の記録",
  "高単価案件への道",
  "40代からのエンジニア転身",
  "Flutter · Shopify · AI",
]

export function BlogHero() {
  const heroRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const reveals = heroRef.current?.querySelectorAll(".reveal")
    if (!reveals) return
    const obs = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add("visible") }),
      { threshold: 0.1 }
    )
    reveals.forEach((el) => obs.observe(el))
    setTimeout(() => reveals.forEach((el) => el.classList.add("visible")), 80)
    return () => obs.disconnect()
  }, [])

  return (
    <>
      {/* TICKER */}
      <div className="ticker-wrap" style={{ marginTop: 0, paddingTop: "80px", background: "var(--noto-bg)" }}>
        <div className="ticker-track">
          {[...tickerItems, ...tickerItems].map((item, i) => (
            <span key={i} className="ticker-item">
              {item} <span className="ticker-dot">✦</span>
            </span>
          ))}
        </div>
      </div>

      {/* HERO */}
      <section className="hero" ref={heroRef}>
        <div className="hero-bg-number" aria-hidden>01</div>
        <div className="hero-content">
          <p className="hero-issue reveal">
            Nomad Code Recipe — AI &amp; Engineering Log
          </p>
          <h1 className="hero-headline reveal reveal-delay-1">
            試して、捨てて、<br />
            <em>残した</em><br />
            判断の記録
          </h1>
          <div className="hero-sub reveal reveal-delay-2">
            <p className="hero-desc">
              AIとの対話から生まれる思考の痕跡。
              高単価案件獲得に辿り着くまでの遠回りログ。
            </p>
            <Link href="#stories" className="hero-cta">記事を読む</Link>
          </div>
        </div>
      </section>
    </>
  )
}
