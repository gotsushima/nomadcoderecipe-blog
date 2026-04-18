import Link from 'next/link'
import { getAllPostMeta } from '@/lib/posts'
import { resolveDesignParams, paletteToCssVars } from '@/lib/design'
import { ThemeHeader } from '@/components/themes'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'nomadcoderecipe — blog',
  description: 'AIとの対話から生まれる思考の記録。Claude・ChatGPTとの会話を毎日要約・公開。',
}

export const revalidate = 3600

export default function HomePage() {
  const posts = getAllPostMeta()

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-16">
      <header className="mb-16">
        <p className="mb-2 font-mono text-sm" style={{ color: 'var(--color-muted)' }}>
          nomadcoderecipe / blog
        </p>
        <h1
          className="text-5xl font-bold tracking-tight"
          style={{ fontFamily: 'var(--font-space-grotesk, system-ui)' }}
        >
          思考の痕跡
        </h1>
        <p className="mt-4 text-lg" style={{ color: 'var(--color-muted)' }}>
          Claude と ChatGPT との対話から生まれる、毎日の思考記録。
        </p>
      </header>

      {posts.length === 0 ? (
        <div
          className="rounded-lg border p-12 text-center"
          style={{ borderColor: 'var(--color-surface)', color: 'var(--color-muted)' }}
        >
          <p className="font-mono text-sm">記事はまだありません</p>
          <p className="mt-2 text-xs">自動生成が始まると毎日更新されます</p>
        </div>
      ) : (
        <ol className="space-y-8" reversed>
          {posts.map((post) => {
            const design = resolveDesignParams(post.slug, post.theme)
            const cssVars = paletteToCssVars(design.palette)

            return (
              <li key={post.slug}>
                <Link
                  href={`/${post.slug}`}
                  className="group block overflow-hidden rounded-xl transition-transform duration-300 hover:-translate-y-1"
                  style={{ backgroundColor: 'var(--color-surface)', ...cssVars } as React.CSSProperties}
                >
                  {/* ミニチュアテーマビジュアル */}
                  <div className="pointer-events-none h-32 w-full overflow-hidden opacity-60">
                    <div
                      style={{
                        transform: 'scale(0.31)',
                        transformOrigin: 'top left',
                        width: '323%',
                        height: '323%',
                      }}
                    >
                      <ThemeHeader
                        theme={design.theme}
                        seed={design.seed}
                        speedMultiplier={design.speedMultiplier}
                        title={post.title}
                      />
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="mb-3 flex flex-wrap items-center gap-3">
                      <time dateTime={post.date} className="font-mono text-xs" style={{ color: 'var(--color-muted)' }}>
                        {post.date}
                      </time>
                      <span
                        className="rounded px-2 py-0.5 font-mono text-xs capitalize"
                        style={{ backgroundColor: 'var(--color-bg)', color: 'var(--color-primary)' }}
                      >
                        {post.theme}
                      </span>
                      <span className="font-mono text-xs" style={{ color: 'var(--color-muted)' }}>
                        {post.readingTime} min read
                      </span>
                    </div>

                    <h2
                      className="mb-2 text-xl font-bold leading-snug transition-opacity group-hover:opacity-80"
                    >
                      {post.title}
                    </h2>

                    <p className="line-clamp-2 text-sm" style={{ color: 'var(--color-muted)' }}>
                      {post.summary}
                    </p>

                    <div className="mt-4 flex gap-2">
                      {post.sources.map((src) => (
                        <span
                          key={src}
                          className="rounded-full px-2.5 py-0.5 font-mono text-xs"
                          style={{ backgroundColor: 'var(--color-bg)', color: 'var(--color-secondary)' }}
                        >
                          {src === 'claude' ? 'Claude' : 'ChatGPT'}
                        </span>
                      ))}
                    </div>
                  </div>
                </Link>
              </li>
            )
          })}
        </ol>
      )}
    </main>
  )
}
