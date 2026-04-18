"use client"

import { motion } from "framer-motion"

const marqueeItems = [
  "試して", "捨てて", "残した判断", "AI × Engineering", "40代エンジニア",
  "高単価案件", "Flutter", "Shopify", "ElevenLabs", "副業記録",
]

export function BlogHero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Large background text */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
        className="absolute inset-0 flex items-center justify-center pointer-events-none select-none"
      >
        <h1 className="text-[20vw] md:text-[25vw] font-medium text-primary leading-none tracking-tighter opacity-[0.06]">
          記録
        </h1>
      </motion.div>

      {/* Center content */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 text-center px-6"
      >
        <span className="text-xs tracking-[0.3em] text-muted-foreground uppercase block mb-6">
          Nomad Code Recipe
        </span>
        <p className="text-xl md:text-3xl font-medium tracking-tight text-primary/80 max-w-lg mx-auto leading-snug">
          試して、捨てて、
          <br />
          <span className="font-serif italic text-primary">残した判断の記録。</span>
        </p>
        <p className="mt-4 text-sm text-muted-foreground max-w-sm mx-auto leading-relaxed">
          高単価案件獲得に辿り着くまでの遠回りログ
        </p>
      </motion.div>

      {/* Scrolling marquee */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.8 }}
        className="absolute bottom-24 left-0 right-0 overflow-hidden"
      >
        <div className="flex whitespace-nowrap" style={{ animation: "marquee 28s linear infinite" }}>
          {[...Array(3)].map((_, gi) => (
            <span key={gi} className="flex flex-shrink-0">
              {marqueeItems.map((item, i) => (
                <span key={i} className="mx-6 text-xs tracking-[0.25em] text-muted-foreground/60 uppercase">
                  {item} •
                </span>
              ))}
            </span>
          ))}
        </div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9, duration: 0.6 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
      >
        <span className="text-xs tracking-widest text-muted-foreground/60">[ Scroll ]</span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          className="w-px h-8 bg-muted-foreground/30"
        />
      </motion.div>
    </section>
  )
}
