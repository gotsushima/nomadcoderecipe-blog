"use client"

import Link from "next/link"
import { useEffect, useRef } from "react"
import type { WpPost } from "@/lib/wp-posts"

interface Props {
  posts: WpPost[]
}

export function BlogArticleList({ posts }: Props) {
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

  return (
    <div ref={sectionRef}>
      <div className="section-header reveal" id="issues">
        <h2 className="section-title">All <em>Issues</em></h2>
        <span className="section-count">{String(posts.length).padStart(2, "0")}</span>
      </div>

      <div className="posts-list reveal" id="about">
        {posts.map((post, index) => (
          <Link
            key={post.id}
            href={`/blog/${post.slug}`}
            className="list-item"
          >
            <span className="list-num">
              {String(posts.length - index).padStart(2, "0")}
            </span>
            <h3 className="list-title">{post.title}</h3>
            <span className="list-cat">{post.category}</span>
            <span className="list-date">{post.date}</span>
          </Link>
        ))}
      </div>
    </div>
  )
}
