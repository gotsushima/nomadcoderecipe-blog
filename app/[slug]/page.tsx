import { notFound } from 'next/navigation'
import Link from 'next/link'
import { MDXRemote } from 'next-mdx-remote/rsc'
import { getPost, getAllSlugs } from '@/lib/posts'
import { resolveDesignParams, paletteToCssVars } from '@/lib/design'
import { ThemeHeader } from '@/components/themes'
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
      <nav
        className="fixed left-0 right-0 top-0 z-50 flex items-center justify-between px-6 py-4 md:px-12"
        style={{
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          backgroundColor: 'oklch(8% 0.02 270 / 0.85)',
          borderBottom: '1px solid var(--color-border)',
        }}
      >
        <Link href="/" className="label hover-line" style={{ color: 'var(--color-muted)' }}>
          ← blog
        </Link>
        <div className="flex items-center gap-4">
          <span className="label" style={{ color: 'var(--color-muted)' }}>{post.date}</span>
          <span
            className="label"
            style={{
              color: 'var(--color-primary)',
              border: '1px solid var(--color-border)',
              padding: '0.2em 0.6em',
              borderRadius: 4,
            }}
          >
            {post.theme}
          </span>
        </div>
      </nav>

      {/* ── ジェネレーティブアートヘッダー ── */}
      <div style={{ paddingTop: '57px' }}>
        <ThemeHeader
          theme={design.theme}
          seed={design.seed}
          speedMultiplier={design.speedMultiplier}
          title={post.title}
        />
      </div>

      {/* ── 記事ヘッダー ── */}
      <header
        className="mx-auto max-w-3xl px-6 pb-12 pt-16 md:px-8"
        style={{ borderBottom: '1px solid var(--color-border)' }}
      >
        {/* メタ情報 */}
        <div className="animate-fade-up mb-6 flex flex-wrap items-center gap-4">
          <time
            dateTime={post.date}
            className="label"
            style={{ color: 'var(--color-muted)' }}
          >
            {post.date}
          </time>
          <span className="label" style={{ color: 'var(--color-muted)' }}>
            {post.readingTime} min read
          </span>
          <div className="flex gap-2">
            {post.sources.map((src) => (
              <span
                key={src}
                className="label"
                style={{
                  border: '1px solid var(--color-border)',
                  padding: '0.2em 0.6em',
                  borderRadius: 4,
                  color: 'var(--color-secondary)',
                }}
              >
                {src === 'claude' ? 'Claude' : 'ChatGPT'}
              </span>
            ))}
          </div>
        </div>

        {/* タイトル */}
        <h1
          className="animate-fade-up delay-1"
          style={{
            fontSize: 'var(--text-3xl)',
            fontFamily: 'var(--font-heading, var(--font-space-grotesk, system-ui))',
            lineHeight: 1.05,
            letterSpacing: '-0.035em',
            color: 'var(--color-text)',
            marginBottom: '1.5rem',
          }}
        >
          {post.title}
        </h1>

        {/* リード文 */}
        <p
          className="animate-fade-up delay-2"
          style={{
            fontSize: 'var(--text-lg)',
            color: 'var(--color-muted)',
            lineHeight: 1.65,
            maxWidth: '60ch',
            borderLeft: '2px solid var(--color-primary)',
            paddingLeft: '1.25rem',
          }}
        >
          {post.summary}
        </p>
      </header>

      {/* ── 記事本文 ── */}
      <article className="mx-auto max-w-3xl px-6 py-14 md:px-8">
        <div className="prose animate-fade-up delay-3">
          <MDXRemote source={post.content} />
        </div>
      </article>

      {/* ── フッター ── */}
      <footer
        className="mx-auto max-w-3xl px-6 pb-20 pt-12 md:px-8"
        style={{ borderTop: '1px solid var(--color-border)' }}
      >
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="label hover-line"
            style={{ color: 'var(--color-primary)' }}
          >
            ← 記事一覧
          </Link>
          <span className="label" style={{ color: 'var(--color-muted)' }}>
            nomadcoderecipe
          </span>
        </div>
      </footer>
    </div>
  )
}
