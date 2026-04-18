"use client"

import { motion } from "framer-motion"

export function BlogAbout() {
  return (
    <section id="about" className="px-6 py-32 md:px-12 border-t border-border">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            <span className="text-xs tracking-[0.3em] text-muted-foreground uppercase block mb-4">
              About
            </span>
            <h2 className="text-5xl md:text-7xl font-medium tracking-tight text-primary">
              判断の
              <br />
              <span className="font-serif italic">記録</span>
            </h2>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col justify-center"
          >
            <p className="text-xl md:text-2xl text-primary/80 leading-relaxed mb-8">
              試して、捨てて、残した判断の記録。
            </p>
            <p className="text-base text-muted-foreground leading-relaxed mb-12">
              40代・音楽家からエンジニアに転身。独学でFlutter・Shopify・AIを習得し、
              高単価案件を獲得するまでの遠回りをそのまま書いています。
              成功談ではなく、判断の記録です。
            </p>
            <div className="grid grid-cols-2 gap-8">
              <div>
                <span className="text-4xl md:text-5xl font-medium text-accent">10+</span>
                <span className="block text-xs tracking-widest text-muted-foreground uppercase mt-2">
                  Articles Published
                </span>
              </div>
              <div>
                <span className="text-4xl md:text-5xl font-medium text-accent">40代</span>
                <span className="block text-xs tracking-widest text-muted-foreground uppercase mt-2">
                  Career Pivot
                </span>
              </div>
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="mt-32 border-l-2 border-accent pl-8 md:pl-16"
        >
          <blockquote className="text-2xl md:text-4xl font-serif italic text-primary/90 leading-relaxed">
            &ldquo;努力をやめた日から、単価が上がった。&rdquo;
          </blockquote>
          <cite className="block mt-6 text-sm text-muted-foreground not-italic tracking-widest uppercase">
            — Nomad Code Recipe
          </cite>
        </motion.div>
      </div>
    </section>
  )
}
