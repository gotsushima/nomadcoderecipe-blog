"use client"

import Link from "next/link"
import { useEffect, useRef } from "react"
import type { WpPost } from "@/lib/wp-posts"

interface Props {
  posts: WpPost[]
}

const gridCols = ["col-7", "col-5", "col-4", "col-8"]
const fills = ["fill-2", "fill-3", "fill-4", "fill-5"]

export function BlogFeaturedPosts({ posts }: Props) {
  const sectionRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const reveals = sectionRef.current?.querySelectorAll(".reveal")
    if (!reveals) return
    const obs = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add("visible") }),
      { threshold: 0.08 }
    )
    reveals.forEach((el) => obs.observe(el))
    return () => obs.disconnect()
  }, [])

  const featured = posts[0]
  const grid = posts.slice(1, 5)

  if (!featured) return null

  return (
    <div ref={sectionRef}>
      {/* Featured section header */}
      <div className="section-header reveal">
        <h2 className="section-title">Featured <em>Story</em></h2>
        <span className="section-count">01</span>
      </div>

      {/* Featured card */}
      <Link href={`/blog/${featured.slug}`} className="featured reveal">
        <div className="featured-image">
          <div className="img-placeholder">
            <span className="img-label">NCR</span>
          </div>
        </div>
        <div className="featured-info">
          <div>
            <span className="post-tag">{featured.category}</span>
            <h2 className="featured-title">{featured.title}</h2>
            <div className="featured-meta">
              <div className="meta-item">
                <strong>{featured.date}</strong><br />Published
              </div>
            </div>
          </div>
          <div className="read-btn">
            <span>Read Story</span>
            <span className="arrow">→</span>
          </div>
        </div>
      </Link>

      {/* Grid section header */}
      <div className="section-header reveal" id="stories">
        <h2 className="section-title">Latest <em>Stories</em></h2>
        <span className="section-count">{String(grid.length).padStart(2, "0")}</span>
      </div>

      {/* 12-col asymmetric grid */}
      <div className="posts-grid">
        {grid.map((post, i) => (
          <Link
            key={post.id}
            href={`/blog/${post.slug}`}
            className={`post-card ${gridCols[i] ?? "col-6"} reveal reveal-delay-${i + 1}`}
          >
            <div className={`card-img${i === 1 ? " tall" : ""}`}>
              <div className={`fill ${fills[i]}`} />
            </div>
            <div className="card-body">
              <div className="card-tag">{post.category}</div>
              <h3 className="card-title">{post.title}</h3>
              <div className="card-footer">
                <span>{post.date}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
