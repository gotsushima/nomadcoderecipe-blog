import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import fs from 'fs'
import path from 'path'
import { resolveDesignParams } from '@/lib/design'

/**
 * GET /api/cron/digest
 * Vercel Cron から毎日 00:30 JST (15:30 UTC) に呼ばれる
 *
 * Vercel Hobby: 関数タイムアウト 60s — Claude API + 音声APIの合計が超える場合は
 * scripts/run-digest.ts をローカルまたは Scheduled Tasks MCP で実行すること
 *
 * セキュリティ: CRON_SECRET による Bearer 認証
 */

export const runtime = 'nodejs'
export const maxDuration = 60

// ─── 型定義 ──────────────────────────────────────────────────

interface Source {
  name: string
  rss?: string
  url?: string
}

interface Article {
  source: string
  title: string
  url: string
  body: string
  publishedAt: string | null
}

// ─── ハンドラ ─────────────────────────────────────────────────

export async function GET(req: NextRequest) {
  // 認証
  const cronSecret = process.env['CRON_SECRET']
  if (!cronSecret) return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 })
  const token = req.headers.get('authorization')?.replace('Bearer ', '') ?? ''
  if (!timingSafeEqual(token, cronSecret))
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const date = getYesterdayJST()
  const slug = `${date}-digest`
  const outPath = path.join(process.cwd(), 'posts', `${slug}.mdx`)

  // 既存チェック
  if (fs.existsSync(outPath)) {
    return NextResponse.json({ skipped: true, reason: 'already exists', date })
  }

  // ソース読み込み
  const sourcesPath = path.join(process.cwd(), 'data', 'sources.json')
  if (!fs.existsSync(sourcesPath)) {
    return NextResponse.json({ skipped: true, reason: 'sources.json not found', date })
  }
  const sources = JSON.parse(fs.readFileSync(sourcesPath, 'utf-8')) as Source[]

  // 記事収集
  const articles: Article[] = []
  for (const source of sources) {
    try {
      const fetched = source.rss
        ? await collectFromRSS(source, date)
        : await collectFromHTML(source)
      articles.push(...fetched)
    } catch (e) {
      console.warn(`[cron/digest] ${source.name} 収集失敗:`, e)
    }
  }

  if (articles.length === 0) {
    return NextResponse.json({ skipped: true, reason: 'no articles', date })
  }

  // まとめ生成
  const { title, summary, content, voiceScript } = await generateDigest(articles, date)

  // MDX 書き出し
  const design = resolveDesignParams(slug)
  const mdx = buildMDX({ title, date, slug, summary, content, design })
  fs.mkdirSync(path.join(process.cwd(), 'posts'), { recursive: true })
  fs.writeFileSync(outPath, mdx, 'utf-8')

  // 音声原稿保存
  const scriptDir = path.join(process.cwd(), 'data', 'voice-scripts')
  fs.mkdirSync(scriptDir, { recursive: true })
  fs.writeFileSync(path.join(scriptDir, `${date}.txt`), voiceScript, 'utf-8')

  // ISR 再生成
  revalidatePath('/')

  return NextResponse.json({ success: true, date, articleCount: articles.length })
}

// ─── 収集 ────────────────────────────────────────────────────

function extractTag(xml: string, tag: string): string {
  const m =
    xml.match(new RegExp(`<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]></${tag}>`, 'i')) ??
    xml.match(new RegExp(`<${tag}[^>]*>([^<]*)</${tag}>`, 'i'))
  return m?.[1]?.trim() ?? ''
}

function isOnDate(raw: string | null, target: string): boolean {
  if (!raw) return false
  try {
    const d = new Date(raw)
    d.setHours(d.getHours() + 9)
    return d.toISOString().slice(0, 10) === target
  } catch {
    return false
  }
}

async function collectFromRSS(source: Source, targetDate: string): Promise<Article[]> {
  const res = await fetch(source.rss!, {
    headers: { 'User-Agent': 'NomadCodeRecipe-DigestBot/1.0' },
    signal: AbortSignal.timeout(10_000),
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const xml = await res.text()

  const articles: Article[] = []
  const itemRe = /<item>([\s\S]*?)<\/item>/gi
  let m: RegExpExecArray | null
  while ((m = itemRe.exec(xml)) !== null) {
    const block = m[1]!
    const pubRaw = extractTag(block, 'pubDate') || extractTag(block, 'dc:date') || null
    if (!isOnDate(pubRaw, targetDate)) continue

    const body = (extractTag(block, 'description') || extractTag(block, 'content:encoded') || '')
      .replace(/<[^>]+>/g, '')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 1500)

    articles.push({
      source: source.name,
      title: extractTag(block, 'title'),
      url: extractTag(block, 'link') || extractTag(block, 'guid'),
      body,
      publishedAt: pubRaw ? new Date(pubRaw).toISOString() : null,
    })
  }
  return articles
}

async function collectFromHTML(source: Source): Promise<Article[]> {
  const res = await fetch(source.url!, {
    headers: { 'User-Agent': 'NomadCodeRecipe-DigestBot/1.0' },
    signal: AbortSignal.timeout(12_000),
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const html = await res.text()
  const text = html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 5000)

  return [{ source: source.name, title: `[HTML] ${source.name}`, url: source.url!, body: text, publishedAt: null }]
}

// ─── Claude API ───────────────────────────────────────────────

async function callClaude(prompt: string): Promise<string> {
  const apiKey = process.env['ANTHROPIC_API_KEY']
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY が未設定')

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 6000,
      messages: [{ role: 'user', content: prompt }],
    }),
  })
  if (!res.ok) throw new Error(`Claude API ${res.status}: ${await res.text()}`)
  const data = (await res.json()) as { content: Array<{ text: string }> }
  return data.content[0]?.text ?? ''
}

async function generateDigest(
  articles: Article[],
  date: string,
): Promise<{ title: string; summary: string; content: string; voiceScript: string }> {
  const articleList = articles
    .map((a, i) => `### [${i + 1}] ${a.title}\n出典: ${a.source} | URL: ${a.url}\n${a.body}`)
    .join('\n\n')

  const prompt = `
あなたは技術・AI・デザイン分野のキュレーターです。
${date} に収集された以下の記事を元に、1本の読み物として成立する日刊まとめを書いてください。

## 収集記事
${articleList}

## ルール
- 重複トピックは統合して視点を加える
- 単純な告知・プレスリリースのみの記事は除外
- [HTML] prefix の記事は今日の更新がある場合のみ取り上げる

## 出力構成
# ${date} 日刊まとめ

## 総論
## 注目トピック
## 今日の流れ
## 今日読む価値が高いリンク
## 実務・学習への効き方
## まとめ

---

\`\`\`json
{
  "title": "30字以内のタイトル",
  "summary": "100字以内のSNS用要約",
  "voice_script": "1人ナレーション用音声原稿(話し言葉・[間]マーカー付き・URL除去・Markdown除去・1500〜2000字)"
}
\`\`\`
`

  const raw = await callClaude(prompt)
  const jsonMatch = raw.match(/```json\s*([\s\S]*?)```/)
  if (!jsonMatch?.[1]) throw new Error('JSON 抽出失敗')
  const { title, summary, voice_script } = JSON.parse(jsonMatch[1]) as {
    title: string
    summary: string
    voice_script: string
  }
  return { title, summary, content: raw.replace(/```json[\s\S]*?```/, '').trim(), voiceScript: voice_script }
}

// ─── MDX 生成 ─────────────────────────────────────────────────

function buildMDX(params: {
  title: string
  date: string
  slug: string
  summary: string
  content: string
  design: ReturnType<typeof resolveDesignParams>
}): string {
  const { title, date, slug, summary, content, design } = params
  return `---
title: "${title.replace(/"/g, '\\"')}"
date: "${date}"
slug: "${slug}"
theme: "${design.theme}"
seed: ${design.seed}
hue: ${Math.round(design.hue)}
fontPair: ${(design.seed >> 8) % 8}
speedMultiplier: ${design.speedMultiplier.toFixed(1)}
summary: "${summary.replace(/"/g, '\\"')}"
sources:
  - digest
draft: true
---

${content}
`
}

// ─── ユーティリティ ───────────────────────────────────────────

function getYesterdayJST(): string {
  const now = new Date()
  now.setHours(now.getHours() + 9)
  now.setDate(now.getDate() - 1)
  return now.toISOString().slice(0, 10)
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let result = 0
  for (let i = 0; i < a.length; i++) result |= (a.charCodeAt(i) ?? 0) ^ (b.charCodeAt(i) ?? 0)
  return result === 0
}
