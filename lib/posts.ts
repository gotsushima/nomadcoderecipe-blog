import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import type { ThemeName } from './design'

const POSTS_DIR = path.join(process.cwd(), 'posts')

export interface PostFrontmatter {
  title: string
  date: string
  slug: string
  theme: ThemeName
  seed: number
  hue: number
  fontPair: number
  speedMultiplier: number
  summary: string
  sources: Array<'claude' | 'chatgpt'>
}

export interface PostMeta extends PostFrontmatter {
  readingTime: number
}

export interface Post extends PostMeta {
  content: string
}

function estimateReadingTime(content: string): number {
  const words = content.trim().split(/\s+/).length
  return Math.max(1, Math.ceil(words / 400))
}

function parsePost(slug: string): Post | null {
  const filePath = path.join(POSTS_DIR, `${slug}.mdx`)
  if (!fs.existsSync(filePath)) return null

  const raw = fs.readFileSync(filePath, 'utf-8')
  const { data, content } = matter(raw)

  const frontmatter = data as PostFrontmatter
  return {
    ...frontmatter,
    slug,
    readingTime: estimateReadingTime(content),
    content,
  }
}

/** 全記事のメタ情報を新しい順で返す */
export function getAllPostMeta(): PostMeta[] {
  if (!fs.existsSync(POSTS_DIR)) return []

  return fs
    .readdirSync(POSTS_DIR)
    .filter((f) => f.endsWith('.mdx'))
    .map((f) => f.replace(/\.mdx$/, ''))
    .sort((a, b) => b.localeCompare(a)) // 日付降順 (YYYY-MM-DD)
    .map((slug) => {
      const post = parsePost(slug)
      if (!post) return null
      const { content: _, ...meta } = post
      return meta
    })
    .filter((p): p is PostMeta => p !== null)
}

/** スラッグから記事を取得する */
export function getPost(slug: string): Post | null {
  return parsePost(slug)
}

/** 全スラッグを返す (静的ルート生成用) */
export function getAllSlugs(): string[] {
  if (!fs.existsSync(POSTS_DIR)) return []
  return fs
    .readdirSync(POSTS_DIR)
    .filter((f) => f.endsWith('.mdx'))
    .map((f) => f.replace(/\.mdx$/, ''))
}
