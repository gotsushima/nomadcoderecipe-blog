"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import type { WpPost } from "@/lib/wp-posts"

const GRADIENTS = [
  "from-violet-900/40 via-indigo-900/20 to-transparent",
  "from-indigo-900/40 via-slate-900/20 to-transparent",
  "from-slate-800/60 via-zinc-900/20 to-transparent",
  "from-purple-900/40 via-violet-900/20 to-transparent",
]

interface Props {
  posts: WpPost[]
}

export function BlogFeaturedPosts({ posts }: Props) {
  const featured = posts.slice(0, 4)

  return (
    <section className="px-6 py-32 md:px-12">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="mb-16"
      >
        <span className="text-xs tracking-[0.3em] text-muted-foreground uppercase block mb-4">
          Featured Articles
        </span>
        <h2 className="text-5xl md:text-7xl font-medium tracking-tight text-primary">
          注目の
          <br />
          <span className="font-serif italic">記事</span>
        </h2>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Large card */}
        {featured[0] && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="md:row-span-2"
          >
            <Link
              href={`/blog/${featured[0].slug}`}
              className="group relative flex flex-col justify-end h-full min-h-[420px] p-8 overflow-hidden border border-border hover:border-accent transition-colors"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${GRADIENTS[0]}`} />
              <div className="relative z-10">
                <span className="text-xs tracking-widest text-accent uppercase block mb-3">
                  {featured[0].category}
                </span>
                <h3 className="text-2xl md:text-3xl font-medium text-primary group-hover:text-accent transition-colors leading-tight mb-3">
                  {featured[0].title}
                </h3>
                <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                  {featured[0].excerpt}
                </p>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span>{featured[0].date}</span>
                  <span>·</span>
                  <span>{featured[0].readingTime} min read</span>
                </div>
              </div>
            </Link>
          </motion.div>
        )}

        {/* Smaller cards */}
        {featured.slice(1).map((post, index) => (
          <motion.div
            key={post.id}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: (index + 1) * 0.1, ease: [0.22, 1, 0.36, 1] }}
          >
            <Link
              href={`/blog/${post.slug}`}
              className="group relative flex flex-col justify-end min-h-[200px] p-6 overflow-hidden border border-border hover:border-accent transition-colors"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${GRADIENTS[(index + 1) % GRADIENTS.length]}`} />
              <div className="relative z-10">
                <span className="text-xs tracking-widest text-muted-foreground uppercase block mb-2">
                  {post.category}
                </span>
                <h3 className="text-lg md:text-xl font-medium text-primary group-hover:text-accent transition-colors leading-tight">
                  {post.title}
                </h3>
                <div className="flex items-center gap-3 text-xs text-muted-foreground mt-2">
                  <span>{post.date}</span>
                  <span>·</span>
                  <span>{post.readingTime} min read</span>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
