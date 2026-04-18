import Link from 'next/link'
import { getAllPostMeta } from '@/lib/posts'
import { resolveDesignParams, paletteToCssVars } from '@/lib/design'
import { ParticleField } from '@/components/ui/ParticleField'
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

      {/* ── Cognitive Drift パーティクルフィールド ── */}
      <ParticleField seed={2025} speedMultiplier={0.8} opacity={0.45} />

      {/* ── ノイズテクスチャ ── */}
      <div className="noise-overlay" aria-hidden="true" />

      {/* ── コンテンツ (z-index: 1 でパーティクルの前面) ── */}
      <div style={{ position: 'relative', zIndex: 1 }}>

        {/* ── ナビ ── */}
        <nav
          className="flex items-center justify-between px-6 py-5 md:px-14"
          style={{ borderBottom: '1px solid var(--color-border)' }}
        >
          <span className="label">nomadcoderecipe</span>
          <span className="label" style={{ color: 'var(--color-muted)' }}>
            {posts.length} posts
          </span>
        </nav>

        {/* ── Hero ── */}
        <header className="px-6 pt-20 pb-24 md:px-14 md:pt-32 md:pb-36">
          {/* 小見出し */}
          <div
            className="label mb-8 animate-fade-in"
            style={{ color: 'var(--color-primary)', letterSpacing: '0.2em' }}
          >
            AI × Engineering
          </div>

          <h1
            className="animate-fade-up"
            style={{
              fontSize: 'var(--text-hero)',
              fontFamily: 'var(--font-instrument-serif, Georgia, serif)',
              fontWeight: 400,
              lineHeight: 0.9,
              letterSpacing: '-0.03em',
              color: 'var(--color-text)',
            }}
          >
            Think
            <br />
            <em
              style={{
                fontStyle: 'italic',
                WebkitTextStroke: '1px var(--color-primary)',
                WebkitTextFillColor: 'transparent',
                color: 'transparent',
              }}
            >
              ing
            </em>
            <br />
            with AI.
          </h1>

          <p
            className="mt-12 animate-fade-up delay-1"
            style={{
              fontSize: 'var(--text-sm)',
              color: 'var(--color-muted)',
              maxWidth: '44ch',
              lineHeight: 1.8,
              letterSpacing: '0.01em',
            }}
          >
            Claude と ChatGPT との実際の対話から生まれる技術的洞察を毎日公開。
            設計・アーキテクチャ・エンジニアリングの思考過程。
          </p>

          {/* スクロールインジケーター */}
          <div
            className="mt-16 animate-fade-up delay-2"
            style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}
            aria-hidden="true"
          >
            <span className="scroll-dot" />
            <span className="label" style={{ color: 'var(--color-border)', letterSpacing: '0.15em' }}>
              scroll
            </span>
          </div>
        </header>

        {/* ── セパレーター ── */}
        <div
          className="px-6 md:px-14"
          style={{ borderTop: '1px solid var(--color-border)' }}
        >
          <div
            className="label py-4"
            style={{
              color: 'var(--color-muted)',
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
            }}
          >
            <span style={{ color: 'var(--color-primary)', opacity: 0.6 }}>▸</span>
            最新の記事
          </div>
        </div>

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

                      {/* ホバー時の背景グロー */}
                      <span className="post-glow" aria-hidden="true" />

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
                          className="post-title"
                          style={{
                            fontSize: 'var(--text-2xl)',
                            fontFamily: 'var(--font-instrument-serif, Georgia, serif)',
                            fontWeight: 400,
                            fontStyle: 'italic',
                            letterSpacing: '-0.02em',
                            lineHeight: 1.1,
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
                            lineHeight: 1.75,
                          }}
                        >
                          {post.summary}
                        </p>

                        {/* ソースバッジ */}
                        <div className="mt-5 flex gap-2">
                          {post.sources.map((src) => (
                            <span
                              key={src}
                              className="label source-badge"
                              style={{
                                border: '1px solid var(--color-border)',
                                padding: '0.25em 0.75em',
                                borderRadius: 3,
                                color: 'var(--color-secondary)',
                                transition: 'border-color 300ms ease, color 300ms ease',
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

      </div>{/* /relative z-1 */}
    </div>
  )
}
