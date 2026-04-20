/**
 * /drafts — 下書き一覧 (開発環境専用)
 * 本番では 404 を返す
 */
import { notFound } from 'next/navigation'
import Link from 'next/link'
import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

export default function DraftsPage() {
  if (process.env.NODE_ENV !== 'development') notFound()

  const postsDir = path.join(process.cwd(), 'posts')
  if (!fs.existsSync(postsDir)) {
    return <Empty />
  }

  type DraftEntry = { slug: string; title?: string; date?: string; summary?: string; draft?: boolean }

  const drafts: DraftEntry[] = fs
    .readdirSync(postsDir)
    .filter((f) => f.endsWith('.mdx'))
    .map((f) => {
      const raw = fs.readFileSync(path.join(postsDir, f), 'utf-8')
      const { data } = matter(raw)
      const d = data as Record<string, unknown>
      return {
        slug: f.replace(/\.mdx$/, ''),
        title: typeof d['title'] === 'string' ? d['title'] : undefined,
        date: typeof d['date'] === 'string' ? d['date'] : undefined,
        summary: typeof d['summary'] === 'string' ? d['summary'] : undefined,
        draft: d['draft'] === true,
      }
    })
    .filter((p) => p.draft === true)
    .sort((a, b) => b.slug.localeCompare(a.slug))

  if (drafts.length === 0) return <Empty />

  return (
    <div style={{ padding: '2rem', fontFamily: 'monospace', background: '#0a0a0a', minHeight: '100dvh', color: '#e0e0e0' }}>
      <p style={{ color: '#888', marginBottom: '0.5rem', fontSize: '0.75rem' }}>DEV ONLY — 本番では表示されません</p>
      <h1 style={{ fontSize: '1.5rem', marginBottom: '2rem', color: '#fff' }}>📝 下書き一覧</h1>
      <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {drafts.map((d) => (
          <li key={String(d.slug)} style={{ borderLeft: '2px solid #444', paddingLeft: '1rem' }}>
            <Link
              href={`/${d.slug}`}
              style={{ color: '#7dd3fc', textDecoration: 'none', fontSize: '1rem', display: 'block' }}
            >
              {String(d.title ?? d.slug)}
            </Link>
            <span style={{ color: '#666', fontSize: '0.75rem' }}>
              {String(d.date ?? '')} · slug: {String(d.slug)}
            </span>
            <p style={{ color: '#aaa', fontSize: '0.8rem', margin: '0.25rem 0 0' }}>
              {String(d.summary ?? '')}
            </p>
          </li>
        ))}
      </ul>
      <p style={{ marginTop: '2rem', color: '#555', fontSize: '0.75rem' }}>
        公開するには frontmatter の <code style={{ color: '#fbbf24' }}>draft: true</code> を削除してください
      </p>
    </div>
  )
}

function Empty() {
  return (
    <div style={{ padding: '2rem', fontFamily: 'monospace', background: '#0a0a0a', minHeight: '100dvh', color: '#888' }}>
      <p>下書きはありません。</p>
      <p style={{ marginTop: '0.5rem', fontSize: '0.8rem' }}>
        <code>npm run digest</code> を実行すると <code>posts/YYYY-MM-DD-digest.mdx</code> が生成されます。
      </p>
    </div>
  )
}
