import { notFound } from 'next/navigation'
import Link from 'next/link'
import { MDXRemote } from 'next-mdx-remote/rsc'
import { getPost, getAllSlugs } from '@/lib/posts'
import { resolveDesignParams, paletteToCssVars } from '@/lib/design'
import { PostBackground } from '@/components/ui/PostBackground'
import type { Metadata } from 'next'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const post = getPost(slug)
  if (!post) return {}
  return {
    title: post.title,
    description: post.summary,
    openGraph: {
      title: post.title,
      description: post.summary,
      type: 'article',
      publishedTime: post.date,
    },
  }
}

export const revalidate = 3600

export default async function PostPage({ params }: Props) {
  const { slug } = await params
  const post = getPost(slug)
  if (!post) notFound()

  const design = resolveDesignParams(slug, post.theme)
  const cssVars = paletteToCssVars(design.palette)

  const pageStyle = {
    ...cssVars,
    '--font-heading': `var(--${design.fontPair.headingClass})`,
    '--font-body': `var(--${design.fontPair.bodyClass})`,
  } as React.CSSProperties

  return (
    <div style={{ ...pageStyle, backgroundColor: 'var(--color-bg)', minHeight: '100dvh' }}>

      {/* ── ナビ ── */}
      <nav className="post-nav">
        <Link href="/" className="post-nav-back label hover-line">
          ← blog
        </Link>
        <div className="flex items-center gap-3">
          <span className="label" style={{ color: 'var(--color-muted)' }}>{post.date}</span>
          <span className="post-theme-badge label">{post.theme}</span>
        </div>
      </nav>

      {/* ── フルビューポートヒーロー ── */}
      <section className="post-hero" aria-label="Article hero">
        {/* Canvas アニメーション背景 */}
        <PostBackground seed={design.seed} speedMultiplier={design.speedMultiplier} />

        {/* 中央コンテンツ */}
        <div className="post-hero-inner">
          <p className="post-kicker animate-fade-in">
            {post.theme}
          </p>

          <h1
            className="post-hero-title animate-fade-up delay-1"
            style={{ fontFamily: 'var(--font-instrument-serif, Georgia, serif)', fontStyle: 'italic', fontWeight: 400 }}
          >
            {post.title}
          </h1>

          <div className="post-hero-meta animate-fade-up delay-2">
            <time dateTime={post.date}>{post.date}</time>
            <span className="post-hero-dot" aria-hidden="true" />
            <span>{post.readingTime} min read</span>
            {post.sources.length > 0 && (
              <>
                <span className="post-hero-dot" aria-hidden="true" />
                {post.sources.map((src) => (
                  <span key={src} className="post-source-pill">
                    {src === 'claude' ? 'Claude' : 'ChatGPT'}
                  </span>
                ))}
              </>
            )}
          </div>
        </div>

        {/* スクロールインジケーター */}
        <div className="post-scroll-hint" aria-hidden="true">
          <span className="label" style={{ color: 'var(--color-muted)' }}>scroll</span>
          <div className="post-scroll-line" />
        </div>

        {/* 下部フェードオーバーレイ */}
        <div className="post-hero-vignette" aria-hidden="true" />
      </section>

      {/* ── マーキーストリップ ── */}
      <div className="marquee-outer" aria-hidden="true">
        <div className="marquee-track">
          {[...Array(2)].map((_, gi) => (
            <div key={gi} style={{ display: 'flex' }}>
              {['nomadcoderecipe', 'AI × Engineering', post.theme, 'Claude', 'ChatGPT', '設計', 'アーキテクチャ', 'Thinking with AI'].map((t, i) => (
                <span key={i} className="marquee-item">
                  {t}
                  <span className="marquee-dot" />
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* ── 記事本文 ── */}
      <article className="post-body">

        {/* リード文 */}
        <p className="post-lead animate-fade-up">
          {post.summary}
        </p>

        <div className="prose blur-reveal">
          <MDXRemote source={post.content} />
        </div>
      </article>

      {/* ── フッター ── */}
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
