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

  const bodyStyle = {
    ...cssVars,
    '--font-heading': `var(--${design.fontPair.headingClass})`,
    '--font-body': `var(--${design.fontPair.bodyClass})`,
  } as React.CSSProperties

  return (
    <div style={bodyStyle}>
      {/* ジェネレーティブアートヘッダー */}
      <ThemeHeader
        theme={design.theme}
        seed={design.seed}
        speedMultiplier={design.speedMultiplier}
        title={post.title}
      />

      {/* 記事本体 */}
      <article className="mx-auto w-full max-w-3xl px-4 py-12">
        {/* メタ情報 */}
        <header className="mb-10">
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <Link
              href="/"
              className="font-mono text-xs transition-opacity hover:opacity-70"
              style={{ color: 'var(--color-muted)' }}
            >
              ← blog
            </Link>
            <time dateTime={post.date} className="font-mono text-xs" style={{ color: 'var(--color-muted)' }}>
              {post.date}
            </time>
            <span
              className="rounded px-2 py-0.5 font-mono text-xs capitalize"
              style={{ backgroundColor: 'var(--color-surface)', color: 'var(--color-primary)' }}
            >
              {post.theme}
            </span>
            <span className="font-mono text-xs" style={{ color: 'var(--color-muted)' }}>
              {post.readingTime} min read
            </span>
          </div>

          <h1
            className="text-4xl font-bold leading-tight tracking-tight md:text-5xl"
            style={{ fontFamily: 'var(--font-heading, system-ui)' }}
          >
            {post.title}
          </h1>

          <p className="mt-4 text-lg leading-relaxed" style={{ color: 'var(--color-muted)' }}>
            {post.summary}
          </p>

          <div className="mt-5 flex gap-2">
            {post.sources.map((src) => (
              <span
                key={src}
                className="rounded-full px-3 py-1 font-mono text-xs"
                style={{ backgroundColor: 'var(--color-surface)', color: 'var(--color-secondary)' }}
              >
                {src === 'claude' ? 'Claude' : 'ChatGPT'}
              </span>
            ))}
          </div>
        </header>

        {/* MDX 本文 */}
        <div className="prose">
          <MDXRemote source={post.content} />
        </div>

        {/* フッター */}
        <footer className="mt-16 border-t pt-8" style={{ borderColor: 'var(--color-surface)' }}>
          <Link
            href="/"
            className="font-mono text-sm transition-opacity hover:opacity-70"
            style={{ color: 'var(--color-primary)' }}
          >
            ← 記事一覧に戻る
          </Link>
        </footer>
      </article>
    </div>
  )
}
