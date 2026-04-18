import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getWpPost, getWpPosts } from '@/lib/wp-posts'
import type { Metadata } from 'next'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  const posts = await getWpPosts()
  return posts.map((p) => ({ slug: p.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const post = await getWpPost(slug)
  if (!post) return {}
  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: 'article',
      publishedTime: post.date,
    },
  }
}

export const revalidate = 3600

export default async function WpPostPage({ params }: Props) {
  const { slug } = await params
  const post = await getWpPost(slug)
  if (!post) notFound()

  return (
    <div style={{ backgroundColor: 'var(--color-bg)', minHeight: '100dvh' }}>

      {/* Nav */}
      <nav className="post-nav">
        <Link href="/" className="post-nav-back label hover-line">
          ← blog
        </Link>
        <div className="flex items-center gap-3">
          <span className="label" style={{ color: 'var(--color-muted)' }}>{post.date}</span>
          <span className="post-theme-badge label">{post.category}</span>
        </div>
      </nav>

      {/* Hero */}
      <header
        style={{
          paddingTop: '8rem',
          paddingBottom: '4rem',
          paddingLeft: '1.5rem',
          paddingRight: '1.5rem',
          maxWidth: '800px',
          margin: '0 auto',
        }}
      >
        <p
          className="label"
          style={{ color: 'var(--color-primary)', letterSpacing: '0.2em', marginBottom: '1.5rem' }}
        >
          {post.category}
        </p>
        <h1
          style={{
            fontSize: 'clamp(2rem, 6vw, 4rem)',
            fontWeight: 510,
            lineHeight: 1.1,
            letterSpacing: '-0.02em',
            color: 'var(--color-text)',
            marginBottom: '2rem',
          }}
        >
          {post.title}
        </h1>
        <div
          className="label"
          style={{
            color: 'var(--color-muted)',
            display: 'flex',
            gap: '1rem',
            flexWrap: 'wrap',
          }}
        >
          <time dateTime={post.date}>{post.date}</time>
          <span style={{ opacity: 0.4 }}>·</span>
          <span>{post.readingTime} min read</span>
        </div>
      </header>

      {/* WP HTML content */}
      <article
        className="prose wp-content"
        style={{
          maxWidth: '720px',
          margin: '0 auto',
          padding: '0 1.5rem 7rem',
        }}
        dangerouslySetInnerHTML={{ __html: post.content }}
      />

      {/* Footer */}
      <footer className="post-footer-bar">
        <Link href="/" className="label hover-line" style={{ color: 'var(--color-primary)' }}>
          ← 記事一覧
        </Link>
        <span className="label" style={{ color: 'var(--color-muted)' }}>
          nomadcoderecipe
        </span>
      </footer>
    </div>
  )
}
