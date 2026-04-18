"use client"

import { motion } from "framer-motion"
import Link from "next/link"

export function BlogFooter() {
  return (
    <footer className="px-6 py-16 md:px-12 border-t border-border">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="md:col-span-2"
          >
            <Link href="/" className="inline-block mb-4">
              <span className="text-3xl md:text-5xl font-medium tracking-tighter text-primary">
                NCR
              </span>
            </Link>
            <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
              試して、捨てて、残した判断の記録。<br />
              高単価案件獲得に辿り着くまでの遠回りログ。
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <span className="text-xs tracking-widest text-muted-foreground uppercase block mb-4">
              Links
            </span>
            <ul className="space-y-2">
              <li>
                <Link href="#articles" className="text-sm text-primary/70 hover:text-accent transition-colors">
                  記事一覧
                </Link>
              </li>
              <li>
                <Link href="#about" className="text-sm text-primary/70 hover:text-accent transition-colors">
                  About
                </Link>
              </li>
              <li>
                <a
                  href="https://www.nomadcoderecipe.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary/70 hover:text-accent transition-colors inline-flex items-center gap-1"
                >
                  WordPress版 <span className="text-xs">↗</span>
                </a>
              </li>
            </ul>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-16 pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4"
        >
          <span className="text-xs text-muted-foreground">
            © 2026 Nomad Code Recipe. All rights reserved.
          </span>
          <span className="text-xs text-muted-foreground">
            AI × Engineering — 判断の記録
          </span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 0.04, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="mt-16 overflow-hidden"
        >
          <span className="block text-[15vw] md:text-[18vw] font-medium tracking-tighter text-primary leading-none select-none">
            NOMADCODERECIPE
          </span>
        </motion.div>
      </div>
    </footer>
  )
}
