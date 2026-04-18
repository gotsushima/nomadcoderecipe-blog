"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { useState } from "react"

const navItems = [
  { label: "記事一覧", href: "#articles" },
  { label: "About", href: "#about" },
  { label: "WordPress版 ↗", href: "https://www.nomadcoderecipe.com", external: true },
]

export function BlogHeader() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      className="fixed top-0 left-0 right-0 z-50 mix-blend-difference"
    >
      <div className="flex items-start justify-between px-6 py-6 md:px-12 md:py-8">
        <Link href="/" className="group">
          <span className="text-sm font-medium tracking-widest text-primary">
            NOMADCODERECIPE
          </span>
        </Link>

        <nav className="hidden md:block">
          <ul className="flex flex-col items-end gap-1 text-sm">
            {navItems.map((item, index) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  target={item.external ? "_blank" : undefined}
                  rel={item.external ? "noopener noreferrer" : undefined}
                  className="relative inline-block text-primary/70 transition-colors hover:text-primary"
                  onMouseEnter={() => setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                >
                  <span className="relative">
                    {item.label}
                    {hoveredIndex === index && (
                      <motion.span
                        layoutId="nav-underline"
                        className="absolute -bottom-0.5 left-0 right-0 h-px bg-current"
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        transition={{ duration: 0.2 }}
                      />
                    )}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <span className="hidden md:block text-xs text-primary/50 tracking-wider">
          AI × Engineering
        </span>
      </div>
    </motion.header>
  )
}
