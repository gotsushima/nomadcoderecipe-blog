/**
 * generate-post.ts
 * Scheduled Tasks MCP から毎日 02:00 JST に Claude Code が実行するスクリプト
 *
 * 実行方法:
 *   npx tsx scripts/generate-post.ts [YYYY-MM-DD]
 *
 * 必要な環境変数 (.env.local):
 *   SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 *   REVALIDATE_SECRET
 */

import fs from 'fs'
import path from 'path'
import { execSync } from 'child_process'
import { fetchUnprocessedConversations, markConversationsProcessed } from '../lib/supabase'
import { resolveDesignParams } from '../lib/design'
import type { ThemeName } from '../lib/design'

// ─── 環境変数チェック ───────────────────────────────────────────
function assertEnv(key: string): string {
  const val = process.env[key]
  if (!val) throw new Error(`環境変数 ${key} が未設定です`)
  return val
}

// ─── 日付ユーティリティ ──────────────────────────────────────────
function getTargetDate(arg?: string): string {
  if (arg && /^\d{4}-\d{2}-\d{2}$/.test(arg)) return arg
  // JST で前日の日付を返す
  const now = new Date()
  now.setHours(now.getHours() + 9) // UTC → JST
  now.setDate(now.getDate() - 1)
  return now.toISOString().slice(0, 10)
}

// ─── MDX フロントマター生成 ──────────────────────────────────────
function buildFrontmatter(params: {
  title: string
  date: string
  slug: string
  theme: ThemeName
  seed: number
  hue: number
  fontPair: number
  speedMultiplier: number
  summary: string
  sources: string[]
}): string {
  return `---
title: "${params.title.replace(/"/g, '\\"')}"
date: "${params.date}"
slug: "${params.slug}"
theme: "${params.theme}"
seed: ${params.seed}
hue: ${Math.round(params.hue)}
fontPair: ${params.fontPair}
speedMultiplier: ${params.speedMultiplier.toFixed(1)}
summary: "${params.summary.replace(/"/g, '\\"')}"
sources:
${params.sources.map((s) => `  - ${s}`).join('\n')}
---`
}

// ─── メイン処理 ─────────────────────────────────────────────────
async function main() {
  const date = getTargetDate(process.argv[2])
  console.log(`[generate-post] 対象日: ${date}`)

  // 1. 未処理会話を取得
  const conversations = await fetchUnprocessedConversations(date)
  if (conversations.length === 0) {
    console.log('[generate-post] 未処理の会話が見つかりません。スキップします。')
    return
  }
  console.log(`[generate-post] ${conversations.length}件の会話を取得しました`)

  // 2. DESIGN.md を読み込む (Claude Code がコンテキストとして利用)
  const designMd = fs.readFileSync(
    path.join(process.cwd(), '..', '..', '..', 'DESIGN.md'),
    'utf-8',
  )

  // 3. 会話テキストを結合
  const conversationText = conversations
    .map((c) => `## ${c.source === 'claude' ? 'Claude' : 'ChatGPT'} との会話\n\n${c.raw_text}`)
    .join('\n\n---\n\n')

  const sources = [...new Set(conversations.map((c) => c.source))]

  // ────────────────────────────────────────────────────────────────
  // NOTE: この部分は Claude Code が自身のコンテキストで実行するため、
  // Anthropic API を直接呼び出すのではなく、Claude Code がこのスクリプトを
  // 実行する際に以下のプロンプトを処理して MDX を生成する。
  //
  // Scheduled Tasks MCP で Claude Code 自身がこのファイルを読み、
  // 以下の PROMPT_TEMPLATE に従って記事を生成・書き出す。
  // ────────────────────────────────────────────────────────────────

  const PROMPT_TEMPLATE = `
以下の会話内容を元に、ブログ記事を日本語で生成してください。

=== DESIGN.md (デザイン仕様) ===
${designMd}

=== 会話内容 ===
${conversationText}

=== 出力形式 (JSON) ===
{
  "title": "30字以内の記事タイトル",
  "theme": "orbital|wave|noise|geometric|flow|grid|void|glyph のいずれか",
  "summary": "100字以内の要約 (SNS用)",
  "content": "MDX形式の記事本文 (## 見出し や段落を含む、1000字以上)"
}

DESIGN.md のテーマ選択ルールに従い、会話のトーンに最適なテーマを選択してください。
`

  // スクリプト実行時に Claude Code が上記プロンプトを処理済みと仮定し、
  // 生成結果を環境変数またはファイルから受け取る設計にする。
  // 実際の運用: Claude Code が Scheduled Tasks で
  // このスクリプトを「実行する指示」として読み、内容を生成して直接ファイル書き出しを行う。

  // テスト・デモ用のフォールバック生成 (Claude Code 非経由の直接実行時)
  const design = resolveDesignParams(date)
  const generatedTitle = `${date} の思考記録`
  const generatedSummary = conversations[0]?.title ?? `${date}のAI対話から得られた洞察`
  const generatedContent = conversations
    .map(
      (c) =>
        `## ${c.source === 'claude' ? 'Claudeとの対話' : 'ChatGPTとの対話'}\n\n${c.raw_text.slice(0, 800)}`,
    )
    .join('\n\n')

  // 4. MDX ファイルを書き出す
  const frontmatter = buildFrontmatter({
    title: generatedTitle,
    date,
    slug: date,
    theme: design.theme,
    seed: design.seed,
    hue: design.hue,
    fontPair: 0,
    speedMultiplier: design.speedMultiplier,
    summary: generatedSummary,
    sources,
  })

  const mdxContent = `${frontmatter}\n\n${generatedContent}\n`
  const outPath = path.join(process.cwd(), 'posts', `${date}.mdx`)
  fs.writeFileSync(outPath, mdxContent, 'utf-8')
  console.log(`[generate-post] 記事を書き出しました: ${outPath}`)

  // 5. 会話を処理済みにマーク
  await markConversationsProcessed(conversations.map((c) => c.id))
  console.log('[generate-post] 会話を処理済みにマークしました')

  // 6. git commit + push → Vercel 自動デプロイ
  try {
    execSync(`git add posts/${date}.mdx`, { cwd: process.cwd(), stdio: 'pipe' })
    execSync(`git commit -m "blog: add post ${date}"`, { cwd: process.cwd(), stdio: 'pipe' })
    execSync('git push origin main', { cwd: process.cwd(), stdio: 'pipe' })
    console.log('[generate-post] git push 完了 → Vercel が自動デプロイします')
  } catch (e) {
    console.error('[generate-post] git push 失敗:', e)
    // push 失敗でもスクリプト自体はエラーにしない (ファイルは書き出し済み)
  }

  // 7. ISR revalidate を叩く (即時反映)
  const revalidateSecret = process.env['REVALIDATE_SECRET']
  if (revalidateSecret) {
    const baseUrl = process.env['NEXT_PUBLIC_BASE_URL'] ?? 'https://nomadcoderecipe.com/blog'
    await fetch(`${baseUrl}/api/revalidate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${revalidateSecret}`,
      },
      body: JSON.stringify({ slug: date }),
    }).catch((e) => console.warn('[generate-post] revalidate 失敗:', e))
  }

  console.log('[generate-post] 完了')
}

main().catch((e) => {
  console.error('[generate-post] エラー:', e)
  process.exit(1)
})
