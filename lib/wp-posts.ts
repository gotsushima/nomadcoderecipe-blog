export interface WpPost {
  id: number
  slug: string
  title: string
  date: string          // ISO 8601
  excerpt: string       // HTML stripped
  content: string       // HTML (for rendering on post page)
  category: string      // derived from tags/title
  readingTime: number   // estimated
  featuredImage: string | null
}

const WP_API = 'https://www.nomadcoderecipe.com/wp-json/wp/v2'

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '').replace(/&[a-z]+;/g, (e) =>
    (({ '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"', '&#039;': "'", '&nbsp;': ' ' } as Record<string, string>)[e] ?? e)
  ).trim()
}

function estimateReadingTime(html: string): number {
  const words = stripHtml(html).split(/\s+/).length
  return Math.max(1, Math.round(words / 400))
}

function deriveCategory(title: string): string {
  if (/ElevenLabs|音声|音楽/.test(title)) return 'AI Tools'
  if (/Flutter|IoT|アプリ|開発/.test(title)) return 'Development'
  if (/Shopify|EC|商材/.test(title)) return 'Business'
  if (/副業|エージェント|案件|フリーランス/.test(title)) return 'Freelance'
  if (/単価|収入|稼/.test(title)) return 'Career'
  if (/AI|ツール/.test(title)) return 'AI Tools'
  return 'Engineering'
}

export async function getWpPosts(): Promise<WpPost[]> {
  try {
    const res = await fetch(
      `${WP_API}/posts?per_page=100&_fields=id,title,date,slug,excerpt,content&orderby=date&order=desc`,
      { next: { revalidate: 3600 } }
    )
    if (!res.ok) return []
    const raw = await res.json()

    return raw.map((p: {
      id: number
      slug: string
      title: { rendered: string }
      date: string
      excerpt: { rendered: string }
      content: { rendered: string }
    }): WpPost => ({
      id: p.id,
      slug: p.slug,
      title: stripHtml(p.title.rendered),
      date: p.date.split('T')[0] ?? p.date,
      excerpt: stripHtml(p.excerpt.rendered).slice(0, 120),
      content: p.content.rendered,
      category: deriveCategory(stripHtml(p.title.rendered)),
      readingTime: estimateReadingTime(p.content.rendered),
      featuredImage: null,
    }))
  } catch {
    return []
  }
}

export async function getWpPost(slug: string): Promise<WpPost | null> {
  try {
    const res = await fetch(
      `${WP_API}/posts?slug=${slug}&_fields=id,title,date,slug,excerpt,content`,
      { next: { revalidate: 3600 } }
    )
    if (!res.ok) return null
    const raw = await res.json()
    if (!raw.length) return null
    const p = raw[0]
    return {
      id: p.id,
      slug: p.slug,
      title: stripHtml(p.title.rendered),
      date: p.date.split('T')[0] ?? p.date,
      excerpt: stripHtml(p.excerpt.rendered).slice(0, 120),
      content: p.content.rendered,
      category: deriveCategory(stripHtml(p.title.rendered)),
      readingTime: estimateReadingTime(p.content.rendered),
      featuredImage: null,
    }
  } catch {
    return null
  }
}
