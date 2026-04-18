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
    <div style={{ minHeight: '100dvh', backgroundColor: 'var(--color-bg)' }}>
      {/* ── Hero ── */}
      <header
        style={{ borderBottom: '1px solid var(--color-border)' }}
        className="px-6 pb-16 pt-20 md:px-12 md:pt-28"
      >
        <div className="mx-auto max-w-6xl">
          <p className="label animate-fade-up mb-6">
            nomadcoderecipe / blog — AI対話記録
          </p>

          <h1
            className="animate-fade-up delay-1"
            style={{
              fontSize: 'var(--text-hero)',
              fontFamily: 'var(--font-space-grotesk, system-ui)',
              lineHeight: 0.92,
              letterSpacing: '-0.04em',
              color: 'var(--color-text)',
              maxWidth: '14ch',
            }}
          >
            Thinking
            <br />
            <span style={{ color: 'var(--color-primary)' }}>with</span>
            <br />
            AI.
          </h1>

          <p
            className="animate-fade-up delay-2 mt-8"
            style={{
              fontSize: 'var(--text-lg)',
              color: 'var(--color-muted)',
              maxWidth: '52ch',
              lineHeight: 1.6,
            }}
          >
            Claude と ChatGPT との実際の対話から生まれる技術的洞察。
            設計判断・アーキテクチャ・エンジニアリングの思考過程を毎日公開。
          </p>

          <div className="animate-fade-up delay-3 mt-10 flex items-center gap-8">
            <div>
              <span
                style={{ fontSize: 'var(--text-3xl)', fontFamily: 'var(--font-space-grotesk)', color: 'var(--color-primary)', fontWeight: 700 }}
              >
                {posts.length}
              </span>
              <span className="label ml-2">posts</span>
            </div>
            <div style={{ width: 1, height: 40, backgroundColor: 'var(--color-border)' }} />
            <div>
              <span className="label">毎日 02:00 JST 自動更新</span>
            </div>
          </div>
        </div>
      </header>

      {/* ── Post List ── */}
      <main className="mx-auto max-w-6xl px-6 py-12 md:px-12">
        {posts.length === 0 ? (
          <div className="py-32 text-center">
            <p className="label">No posts yet — 自動生成が始まると毎日更新されます</p>
          </div>
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
                  style={{ borderTop: '1px solid var(--color-border)' }}
                >
                  <Link
                    href={`/${post.slug}`}
                    className="group block py-8 transition-all duration-500 md:py-10"
                    style={cssVars as React.CSSProperties}
                  >
                    <div className="grid grid-cols-[3rem_1fr] gap-6 md:grid-cols-[4rem_1fr_auto]">
                      {/* 連番 */}
                      <span
                        style={{
                          fontSize: 'var(--text-2xl)',
                          fontFamily: 'var(--font-ibm-plex-mono, monospace)',
                          color: 'var(--color-border)',
                          fontWeight: 700,
                          lineHeight: 1,
                          paddingTop: '0.15em',
                          transition: 'color 400ms var(--ease-out-expo)',
                        }}
                        className="group-hover:text-[var(--color-primary)]"
                      >
                        {num}
                      </span>

                      {/* コンテンツ */}
                      <div>
                        {/* メタ */}
                        <div className="mb-3 flex flex-wrap items-center gap-3">
                          <time
                            dateTime={post.date}
                            className="label"
                            style={{ color: 'var(--color-muted)' }}
                          >
                            {post.date}
                          </time>
                          <span
                            className="label"
                            style={{
                              color: 'var(--color-primary)',
                              borderLeft: '1px solid var(--color-border)',
                              paddingLeft: '0.75rem',
                            }}
                          >
                            {post.theme}
                          </span>
                          <span className="label" style={{ color: 'var(--color-muted)' }}>
                            {post.readingTime} min
                          </span>
                        </div>

                        {/* タイトル */}
                        <h2
                          style={{
                            fontSize: 'var(--text-xl)',
                            fontFamily: 'var(--font-space-grotesk, system-ui)',
                            color: 'var(--color-text)',
                            letterSpacing: '-0.02em',
                            lineHeight: 1.2,
                            transition: 'color 300ms var(--ease-out-expo)',
                          }}
                          className="group-hover:text-[var(--color-primary)] mb-3"
                        >
                          {post.title}
                        </h2>

                        {/* サマリー */}
                        <p
                          style={{
                            fontSize: 'var(--text-sm)',
                            color: 'var(--color-muted)',
                            lineHeight: 1.65,
                            maxWidth: '70ch',
                          }}
                          className="line-clamp-2"
                        >
                          {post.summary}
                        </p>

                        {/* ソースバッジ */}
                        <div className="mt-4 flex gap-2">
                          {post.sources.map((src) => (
                            <span
                              key={src}
                              className="label"
                              style={{
                                border: '1px solid var(--color-border)',
                                padding: '0.2em 0.6em',
                                borderRadius: '4px',
                                color: 'var(--color-secondary)',
                              }}
                            >
                              {src === 'claude' ? 'Claude' : 'ChatGPT'}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* 矢印 (デスクトップのみ) */}
                      <div
                        className="hidden items-center md:flex"
                        style={{
                          color: 'var(--color-border)',
                          fontSize: '1.5rem',
                          transition: 'transform 300ms var(--ease-spring), color 300ms ease',
                        }}
                      >
                        <span
                          className="group-hover:translate-x-2 group-hover:text-[var(--color-primary)]"
                          style={{ display: 'block', transition: 'inherit' }}
                        >
                          →
                        </span>
                      </div>
                    </div>
                  </Link>
                </li>
              )
            })}
          </ol>
        )}
      </main>

      {/* ── Footer ── */}
      <footer
        className="px-6 py-10 md:px-12"
        style={{ borderTop: '1px solid var(--color-border)' }}
      >
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <span className="label">nomadcoderecipe</span>
          <span className="label" style={{ color: 'var(--color-muted)' }}>
            Powered by Claude Code
          </span>
        </div>
      </footer>
    </div>
  )
}
