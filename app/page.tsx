import Link from 'next/link'
import { getAllPostMeta } from '@/lib/posts'
import { resolveDesignParams, paletteToCssVars } from '@/lib/design'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'nomadcoderecipe — blog',
  description: 'AIとの対話から生まれる技術的洞察。Claude・ChatGPTとの会話を毎日記録・公開。',
}

export const revalidate = 3600

export default function HomePage() {
  const posts = getAllPostMeta()

  return (
    <div style={{ minHeight: '100dvh', backgroundColor: 'var(--color-bg)', position: 'relative' }}>

      {/* ── ノイズテクスチャ ── */}
      <div className="noise-overlay" aria-hidden="true" />

      {/* ── ナビ ── */}
      <nav className="flex items-center justify-between px-6 py-5 md:px-14"
        style={{ borderBottom: '1px solid var(--color-border)' }}>
        <span className="label">nomadcoderecipe</span>
        <span className="label" style={{ color: 'var(--color-muted)' }}>
          {posts.length} posts
        </span>
      </nav>

      {/* ── Hero ── */}
      <header className="px-6 pt-16 pb-20 md:px-14 md:pt-24 md:pb-28">
        <h1
          style={{
            fontSize: 'var(--text-hero)',
            fontFamily: 'var(--font-space-grotesk, system-ui)',
            lineHeight: 0.88,
            letterSpacing: '-0.05em',
            color: 'var(--color-text)',
          }}
        >
          Think
          <br />
          <span
            style={{
              WebkitTextStroke: '1.5px var(--color-primary)',
              WebkitTextFillColor: 'transparent',
              color: 'transparent',
            }}
          >
            ing
          </span>
          <br />
          with AI.
        </h1>

        <p
          className="mt-10"
          style={{
            fontSize: 'var(--text-sm)',
            color: 'var(--color-muted)',
            maxWidth: '44ch',
            lineHeight: 1.7,
            letterSpacing: '0.01em',
          }}
        >
          Claude と ChatGPT との実際の対話から生まれる技術的洞察を毎日公開。
          設計・アーキテクチャ・エンジニアリングの思考過程。
        </p>
      </header>

      {/* ── 記事リスト ── */}
      <main className="px-6 pb-40 md:px-14">
        {posts.length === 0 ? (
          <p className="label py-32 text-center">まだ記事がありません</p>
        ) : (
          <ol>
            {posts.map((post, index) => {
              const design = resolveDesignParams(post.slug, post.theme)
              const cssVars = paletteToCssVars(design.palette)
              const num = String(posts.length - index).padStart(2, '0')

              return (
                <li
                  key={post.slug}
                  className="scroll-reveal"
                  style={{
                    ...cssVars as React.CSSProperties,
                    borderTop: '1px solid var(--color-border)',
                  }}
                >
                  <Link
                    href={`/${post.slug}`}
                    className="post-row group block"
                  >
                    {/* 巨大な背景番号 */}
                    <span className="post-num" aria-hidden="true">{num}</span>

                    {/* コンテンツ */}
                    <div className="post-content">
                      {/* メタ */}
                      <div className="label mb-5" style={{ color: 'var(--color-muted)' }}>
                        <time dateTime={post.date}>{post.date}</time>
                        <span style={{ margin: '0 0.75em', opacity: 0.4 }}>·</span>
                        <span style={{ color: 'var(--color-primary)' }}>{post.theme}</span>
                        <span style={{ margin: '0 0.75em', opacity: 0.4 }}>·</span>
                        {post.readingTime} min
                      </div>

                      {/* タイトル */}
                      <h2
                        className="post-title group-hover:text-[var(--color-primary)]"
                        style={{
                          fontSize: 'var(--text-2xl)',
                          fontFamily: 'var(--font-space-grotesk, system-ui)',
                          letterSpacing: '-0.03em',
                          lineHeight: 1.08,
                          color: 'var(--color-text)',
                          transition: 'color 400ms var(--ease-out-expo)',
                        }}
                      >
                        {post.title}
                      </h2>

                      {/* サマリー */}
                      <p
                        className="line-clamp-2 mt-4"
                        style={{
                          fontSize: 'var(--text-sm)',
                          color: 'var(--color-muted)',
                          maxWidth: '62ch',
                          lineHeight: 1.7,
                        }}
                      >
                        {post.summary}
                      </p>

                      {/* ソースバッジ */}
                      <div className="mt-5 flex gap-2">
                        {post.sources.map((src) => (
                          <span
                            key={src}
                            className="label"
                            style={{
                              border: '1px solid var(--color-border)',
                              padding: '0.2em 0.7em',
                              borderRadius: 3,
                              color: 'var(--color-secondary)',
                            }}
                          >
                            {src === 'claude' ? 'Claude' : 'ChatGPT'}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* 矢印 */}
                    <span
                      className="post-arrow group-hover:translate-x-2 group-hover:text-[var(--color-primary)]"
                      aria-hidden="true"
                    >
                      →
                    </span>
                  </Link>
                </li>
              )
            })}
          </ol>
        )}
      </main>

      {/* ── フッター ── */}
      <footer
        className="px-6 py-8 md:px-14"
        style={{ borderTop: '1px solid var(--color-border)' }}
      >
        <div className="flex items-center justify-between">
          <span className="label">nomadcoderecipe</span>
          <span className="label" style={{ color: 'var(--color-muted)' }}>毎日 02:00 JST 自動更新</span>
        </div>
      </footer>
    </div>
  )
}
