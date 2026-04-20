"use client"

import Link from "next/link"
import { useState, useEffect } from "react"

export function BlogHeader() {
  const [isLight, setIsLight] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem("noto-theme")
    if (saved === "light") {
      setIsLight(true)
      document.body.classList.add("light")
    }
  }, [])

  const toggleTheme = () => {
    const next = !isLight
    setIsLight(next)
    document.body.classList.toggle("light", next)
    localStorage.setItem("noto-theme", next ? "light" : "dark")
  }

  const closeDrawer = () => {
    setDrawerOpen(false)
    document.body.style.overflow = ""
  }

  const toggleDrawer = () => {
    const next = !drawerOpen
    setDrawerOpen(next)
    document.body.style.overflow = next ? "hidden" : ""
  }

  return (
    <>
      <nav className="noto-nav">
        <Link href="/" className="nav-logo">NCR</Link>

        <ul className="nav-links">
          <li><Link href="#stories">Stories</Link></li>
          <li><Link href="#issues">Issues</Link></li>
          <li><Link href="#about">About</Link></li>
        </ul>

        <div className="nav-right">
          <button className="theme-toggle" onClick={toggleTheme}>
            {isLight ? "Dark" : "Light"}
          </button>
          <button
            className={`nav-hamburger${drawerOpen ? " open" : ""}`}
            aria-label="メニュー"
            onClick={toggleDrawer}
          >
            <span /><span /><span />
          </button>
        </div>
      </nav>

      <div className={`mobile-drawer${drawerOpen ? " open" : ""}`}>
        <Link href="#stories" onClick={closeDrawer}>Stories</Link>
        <Link href="#issues" onClick={closeDrawer}>Issues</Link>
        <Link href="#about" onClick={closeDrawer}>About</Link>
        <div className="mobile-drawer-bottom">
          NCR — Nomad Code Recipe<br />AI &amp; Engineering Log
        </div>
      </div>
    </>
  )
}
