/**
 * run-digest.ts
 * 情報収集 → 日刊まとめ生成 → 音声化 → git push を1本で行うスクリプト
 *
 * 実行方法:
 *   npx tsx scripts/run-digest.ts [YYYY-MM-DD]
 *   (日付省略時は JST 前日)
 *
 * 必要な環境変数 (.env.local):
 *   ANTHROPIC_API_KEY          必須
 *   ELEVENLABS_API_KEY         任意 (未設定時は音声生成スキップ)
 *   ELEVENLABS_VOICE_ID        任意 (デフォルト: Rachel)
 */

import fs from 'fs'
import path from 'path'
import { execSync } from 'child_process'
import { resolveDesignParams } from '../lib/design'

// ─── .env.local 読み込み (外部依存なし) ────────────────────────
;(function loadEnvLocal() {
  const envPath = path.join(process.cwd(), '.env.local')
  if (!fs.existsSync(envPath)) return
  for (const line of fs.readFileSync(envPath, 'utf-8').split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eqIdx = trimmed.indexOf('=')
    if (eqIdx === -1) continue
    const key = trimmed.slice(0, eqIdx).trim()
    const val = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, '')
    if (key && !(key in process.env)) process.env[key] = val
  }
})()

// ─── 型定義 ────────────────────────────────────────────────────

interface Source {
  name: string
  rss?: string   // RSS URL (あれば RSS 収集)
  url?: string   // サイト URL (RSS なしサイト用)
}

interface Article {
  source: string
  title: string
  url: string
  body: string
  publishedAt: string | null
}

interface DigestResult {
  title: string
  summary: string
  content: string
  voiceScript: string
}

// ─── 日付ユーティリティ ────────────────────────────────────────

function getTargetDate(arg?: string): string {
  if (arg && /^\d{4}-\d{2}-\d{2}$/.test(arg)) return arg
  const now = new Date()
  now.setHours(now.getHours() + 9) // UTC → JST
  now.setDate(now.getDate() - 1)   // 前日
  return now.toISOString().slice(0, 10)
}

// ─── ソース読み込み ────────────────────────────────────────────

function readSources(): Source[] {
  const p = path.join(process.cwd(), 'data', 'sources.json')
  if (!fs.existsSync(p)) {
    console.warn('[digest] data/sources.json が見つかりません')
    return []
  }
  return JSON.parse(fs.readFileSync(p, 'utf-8')) as Source[]
}

// ─── RSS 収集 ──────────────────────────────────────────────────

function extractTag(xml: string, tag: string): string {
  const m =
    xml.match(new RegExp(`<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]></${tag}>`, 'i')) ??
    xml.match(new RegExp(`<${tag}[^>]*>([^<]*)</${tag}>`, 'i'))
  return m?.[1]?.trim() ?? ''
}

function parsePubDateISO(raw: string | null): string | null {
  if (!raw) return null
  try {
    return new Date(raw).toISOString()
  } catch {
    return null
  }
}

function isOnTargetDate(isoDate: string | null, targetDate: string): boolean {
  if (!isoDate) return false
  const d = new Date(isoDate)
  d.setHours(d.getHours() + 9) // UTC → JST
  return d.toISOString().slice(0, 10) === targetDate
}

async function collectFromRSS(source: Source, targetDate: string): Promise<Article[]> {
  const res = await fetch(source.rss!, {
    headers: { 'User-Agent': 'NomadCodeRecipe-DigestBot/1.0' },
    signal: AbortSignal.timeout(12_000),
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const xml = await res.text()

  const articles: Article[] = []
  const itemRe = /<item>([\s\S]*?)<\/item>/gi
  let m: RegExpExecArray | null
  while ((m = itemRe.exec(xml)) !== null) {
    const block = m[1]!
    const pubDate = parsePubDateISO(
      extractTag(block, 'pubDate') || extractTag(block, 'dc:date') || null,
    )
    if (!isOnTargetDate(pubDate, targetDate)) continue

    const body = (extractTag(block, 'description') || extractTag(block, 'content:encoded') || '')
      .replace(/<[^>]+>/g, '')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 1500)

    articles.push({
      source: source.name,
      title: extractTag(block, 'title'),
      url: extractTag(block, 'link') || extractTag(block, 'guid'),
      body,
      publishedAt: pubDate,
    })
  }
  return articles
}

// ─── HTML 収集 (RSS なしサイト) ────────────────────────────────

async function collectFromHTML(source: Source): Promise<Article[]> {
  const res = await fetch(source.url!, {
    headers: { 'User-Agent': 'NomadCodeRecipe-DigestBot/1.0' },
    signal: AbortSignal.timeout(15_000),
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const html = await res.text()

  // script/style を除去してテキスト化
  const text = html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 5000)

  // Claude がまとめ生成時に「今日の更新があるか」を判断する
  return [
    {
      source: source.name,
      title: `[HTML] ${source.name}`,
      url: source.url!,
      body: text,
      publishedAt: null,
    },
  ]
}

// ─── Claude API ────────────────────────────────────────────────

async function callClaude(prompt: string, maxTokens = 6000): Promise<string> {
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
      max_tokens: maxTokens,
      messages: [{ role: 'user', content: prompt }],
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Claude API error ${res.status}: ${err}`)
  }

  const data = (await res.json()) as { content: Array<{ text: string }> }
  return data.content[0]?.text ?? ''
}

// ─── まとめ生成 ────────────────────────────────────────────────

async function generateDigest(articles: Article[], date: string): Promise<DigestResult> {
  const articleList = articles
    .map(
      (a, i) => `
### [${i + 1}] ${a.title}
出典: ${a.source} | URL: ${a.url}
${a.body || '(本文なし)'}`,
    )
    .join('\n')

  const prompt = `
あなたは技術・AI・デザイン分野のキュレーターです。
${date} に収集された以下の記事を元に、個別要約の羅列ではなく **1本の読み物として成立する日刊まとめ** を書いてください。

## 収集記事
${articleList}

## ルール
- 重複するトピックは統合して視点を加える
- 単純な告知・プレスリリースのみの記事は除外するかサラッと触れる程度にする
- [HTML] prefix の記事は、本文中に今日の更新が含まれる場合のみ取り上げる
- 見出しは日本語で書く

## 出力構成 (この順番・この見出しで書くこと)

# ${date} 日刊まとめ

## 総論
(3〜5文。今日の全体像とその意味。「〜の話題が多かった」で終わらせず、なぜ重要かまで踏み込む)

## 注目トピック
(2〜4項目。各項目は ### 見出し + 200〜400字)

## 今日の流れ
(複数記事を横断して見えてくる変化・予兆を150〜250字で論じる)

## 今日読む価値が高いリンク
(3〜5本。形式: - [タイトル](URL) — 一言コメント)

## 実務・学習への効き方
(箇条書き3〜5点)

## まとめ
(80字以内)

---

## JSON (本文の直後に必ず付ける)
\`\`\`json
{
  "title": "30字以内のタイトル",
  "summary": "100字以内のSNS用要約",
  "voice_script": "音声原稿(下記ルールで作成)"
}
\`\`\`

## voice_script のルール
- 上記まとめを1人ナレーション用に変換する
- 読み上げ時間5〜7分 (約1500〜2000字)
- 話し言葉 (〜です・〜ました) で統一
- URLは「リンクは概要欄に貼ります」に置換
- 見出し (##, ###) は読み上げ可能な文に変換 (例: 「## 注目トピック」→「続いて、注目トピックです。」)
- 段落の切れ目に [間] を挿入
- Markdown 記号 (#, *, -, など) はすべて除去
`

  const raw = await callClaude(prompt)

  // JSON ブロックを抽出
  const jsonMatch = raw.match(/```json\s*([\s\S]*?)```/)
  if (!jsonMatch?.[1]) throw new Error('Claude 出力から JSON を抽出できませんでした')

  const { title, summary, voice_script } = JSON.parse(jsonMatch[1]) as {
    title: string
    summary: string
    voice_script: string
  }

  // JSON ブロックを除いた本文
  const content = raw.replace(/```json[\s\S]*?```/, '').trim()

  return { title, summary, content, voiceScript: voice_script }
}

// ─── MDX 生成 ──────────────────────────────────────────────────

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

// ─── 音声生成 (ElevenLabs) ─────────────────────────────────────

async function generateAudio(script: string, date: string): Promise<string | null> {
  const apiKey = process.env['ELEVENLABS_API_KEY']
  if (!apiKey) {
    console.log('[digest] ELEVENLABS_API_KEY 未設定 → 音声生成スキップ')
    return null
  }
  const voiceId = process.env['ELEVENLABS_VOICE_ID'] ?? 'pNInz6obpgDQGcFmaJgB' // Rachel

  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
        method: 'POST',
        headers: {
          'xi-api-key': apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: script,
          model_id: 'eleven_multilingual_v2',
          voice_settings: { stability: 0.5, similarity_boost: 0.75 },
        }),
      })
      if (!res.ok) throw new Error(`ElevenLabs ${res.status}: ${await res.text()}`)

      const buf = await res.arrayBuffer()
      const outDir = path.join(process.cwd(), 'public', 'audio')
      fs.mkdirSync(outDir, { recursive: true })
      const outPath = path.join(outDir, `${date}.mp3`)
      fs.writeFileSync(outPath, Buffer.from(buf))
      return outPath
    } catch (e) {
      console.warn(`[digest] 音声生成 試行${attempt}/3 失敗:`, e)
      if (attempt < 3) await new Promise((r) => setTimeout(r, 2000 * attempt))
    }
  }
  return null
}

// ─── メイン ────────────────────────────────────────────────────

async function main() {
  const date = getTargetDate(process.argv[2])
  console.log(`[digest] 対象日: ${date}`)

  const slug = `${date}-digest`
  const outPath = path.join(process.cwd(), 'posts', `${slug}.mdx`)

  if (fs.existsSync(outPath)) {
    console.log(`[digest] ${slug}.mdx は既に存在します。スキップ。`)
    return
  }

  // 1. ソース読み込み
  const sources = readSources()
  if (sources.length === 0) {
    console.log('[digest] ソースが0件。終了。')
    return
  }

  // 2. 記事収集
  const articles: Article[] = []
  for (const source of sources) {
    try {
      const fetched = source.rss
        ? await collectFromRSS(source, date)
        : await collectFromHTML(source)
      articles.push(...fetched)
      console.log(`[collect] ${source.name}: ${fetched.length}件`)
    } catch (e) {
      console.warn(`[collect] ${source.name} 失敗:`, e)
    }
  }

  if (articles.length === 0) {
    console.log('[digest] 収集記事0件。スキップ。')
    return
  }
  console.log(`[digest] 合計 ${articles.length} 件を収集`)

  // 3. まとめ生成
  console.log('[digest] Claude API でまとめ生成中...')
  const { title, summary, content, voiceScript } = await generateDigest(articles, date)

  // 4. MDX 書き出し
  const design = resolveDesignParams(slug)
  const mdx = buildMDX({ title, date, slug, summary, content, design })
  fs.mkdirSync(path.join(process.cwd(), 'posts'), { recursive: true })
  fs.writeFileSync(outPath, mdx, 'utf-8')
  console.log(`[digest] 書き出し完了: posts/${slug}.mdx`)

  // 5. 音声原稿を保存
  const scriptDir = path.join(process.cwd(), 'data', 'voice-scripts')
  fs.mkdirSync(scriptDir, { recursive: true })
  const scriptPath = path.join(scriptDir, `${date}.txt`)
  fs.writeFileSync(scriptPath, voiceScript, 'utf-8')
  console.log(`[digest] 音声原稿保存: data/voice-scripts/${date}.txt`)

  // 6. 音声生成
  const audioPath = await generateAudio(voiceScript, date)
  if (audioPath) console.log(`[digest] 音声生成完了: ${audioPath}`)

  // 7. git commit + push (失敗してもスクリプトは終了しない)
  try {
    const gitFiles = [`posts/${slug}.mdx`, `data/voice-scripts/${date}.txt`]
    if (audioPath) gitFiles.push(`public/audio/${date}.mp3`)
    execSync(`git add ${gitFiles.join(' ')}`, { cwd: process.cwd(), stdio: 'pipe' })
    execSync(`git commit -m "digest: add ${date}"`, { cwd: process.cwd(), stdio: 'pipe' })
    execSync('git push origin main', { cwd: process.cwd(), stdio: 'pipe' })
    console.log('[digest] git push 完了 → Vercel が自動デプロイします')
  } catch (e) {
    console.warn('[digest] git push 失敗 (ファイルは保存済み):', e)
  }

  console.log('[digest] 完了')
}

main().catch((e) => {
  console.error('[digest] エラー:', e)
  process.exit(1)
})
