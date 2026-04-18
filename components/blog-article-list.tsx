"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import type { WpPost } from "@/lib/wp-posts"

interface Props {
  posts: WpPost[]
}

export function BlogArticleList({ posts }: Props) {
  return (
    <section id="articles" className="px-6 py-32 md:px-12 border-t border-border">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="mb-16"
      >
        <span className="text-xs tracking-[0.3em] text-muted-foreground uppercase block mb-4">
          All Articles
        </span>
        <h2 className="text-5xl md:text-7xl font-medium tracking-tight text-primary">
          最新の
          <br />
          <span className="font-serif italic text-muted-foreground">記事</span>
        </h2>
      </motion.div>

      <div className="space-y-0">
        {posts.map((post, index) => (
          <motion.article
            key={post.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{
              duration: 0.5,
              delay: index * 0.05,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            <Link
              href={`/blog/${post.slug}`}
              className="group flex items-center justify-between py-8 border-b border-border transition-colors hover:border-accent"
            >
              <div className="flex items-start gap-6 md:gap-12">
                <span className="text-xs text-muted-foreground font-mono mt-1 flex-shrink-0">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div className="min-w-0">
                  <h3 className="text-xl md:text-3xl font-medium text-primary tracking-tight group-hover:text-accent transition-colors leading-tight">
                    {post.title}
                  </h3>
                  <div className="flex items-center gap-4 mt-2 flex-wrap">
                    <span className="text-xs tracking-widest text-muted-foreground uppercase">
                      {post.category}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {post.date}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {post.readingTime} min read
                    </span>
                  </div>
                  {post.excerpt && (
                    <p className="mt-2 text-sm text-muted-foreground/70 line-clamp-1 max-w-xl">
                      {post.excerpt}
                    </p>
                  )}
                </div>
              </div>

              <motion.div
                className="hidden md:flex items-center justify-center w-12 h-12 border border-border group-hover:border-accent group-hover:bg-accent/10 transition-all flex-shrink-0 ml-4"
                whileHover={{ scale: 1.1 }}
              >
                <span className="text-muted-foreground group-hover:text-accent transition-colors">
                  →
                </span>
              </motion.div>
            </Link>
          </motion.article>
        ))}
      </div>
    </section>
  )
}
