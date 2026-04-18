import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import fs from 'fs'
import path from 'path'
import { fetchUnprocessedConversations, markConversationsProcessed } from '@/lib/supabase'
import { resolveDesignParams } from '@/lib/design'
import type { ThemeName } from '@/lib/design'

/**
 * GET /api/cron/generate
 * Vercel Cron Jobs から毎日 02:00 JST (17:00 UTC) に呼ばれる
 *
 * セキュリティ:
 * - CRON_SECRET による Bearer 認証
 * - Vercel Cron からのみ受付 (Authorization ヘッダー必須)
 */
export async function GET(req: NextRequest) {
  // ── 認証 ─────────────────────────────────────────────────────
  const cronSecret = process.env['CRON_SECRET']
  if (!cronSecret) {
    console.error('[cron/generate] CRON_SECRET が未設定')
    return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 })
  }

  const authHeader = req.headers.get('authorization')
  const token = authHeader?.replace('Bearer ', '') ?? ''

  if (!timingSafeEqual(token, cronSecret)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // ── 対象日 (JST 前日) ─────────────────────────────────────────
  const date = getYesterdayJST()
  console.log(`[cron/generate] 対象日: ${date}`)

  // ── 既存チェック ──────────────────────────────────────────────
  const postsDir = path.join(process.cwd(), 'posts')
  const outPath = path.join(postsDir, `${date}.mdx`)
  if (fs.existsSync(outPath)) {
    console.log(`[cron/generate] ${date}.mdx は既に存在します。スキップ。`)
    return NextResponse.json({ skipped: true, date })
  }

  // ── 会話取得 ──────────────────────────────────────────────────
  const conversations = await fetchUnprocessedConversations(date)
  if (conversations.length === 0) {
    console.log(`[cron/generate] ${date} の未処理会話なし。スキップ。`)
    return NextResponse.json({ skipped: true, reason: 'no conversations', date })
  }

  // ── デザインパラメータ決定 ────────────────────────────────────
  const design = resolveDesignParams(date)
  const sources = [...new Set(conversations.map((c) => c.source))]

  // ── 記事本文を生成 (会話テキストから構造化) ──────────────────
  // NOTE: 本番では Claude Code 自身がこのエンドポイントを呼ぶ前に
  //       DESIGN.md を読んで内容を生成する。
  //       このルートは「会話取得→MDX書き出し→revalidate」を担当。
  const title = conversations[0]?.title ?? `${date} の思考記録`
  const summary = `${date}のAI対話から得られた洞察の記録。`

  const content = conversations
    .map(
      (c) =>
        `## ${c.source === 'claude' ? 'Claudeとの対話' : 'ChatGPTとの対話'}\n\n${c.raw_text}`,
    )
    .join('\n\n---\n\n')

  const mdx = buildMDX({ title, date, design, sources, summary, content })

  // ── ファイル書き出し ──────────────────────────────────────────
  if (!fs.existsSync(postsDir)) fs.mkdirSync(postsDir, { recursive: true })
  fs.writeFileSync(outPath, mdx, 'utf-8')
  console.log(`[cron/generate] 記事を書き出しました: ${outPath}`)

  // ── 会話を処理済みにマーク ────────────────────────────────────
  await markConversationsProcessed(conversations.map((c) => c.id))

  // ── ISR 再生成 ────────────────────────────────────────────────
  revalidatePath(`/${date}`)
  revalidatePath('/')

  return NextResponse.json({ success: true, date, theme: design.theme })
}

// ─── ユーティリティ ─────────────────────────────────────────────

function getYesterdayJST(): string {
  const now = new Date()
  now.setHours(now.getHours() + 9) // UTC → JST
  now.setDate(now.getDate() - 1)
  return now.toISOString().slice(0, 10)
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let result = 0
  for (let i = 0; i < a.length; i++) {
    result |= (a.charCodeAt(i) ?? 0) ^ (b.charCodeAt(i) ?? 0)
  }
  return result === 0
}

interface BuildMDXParams {
  title: string
  date: string
  design: ReturnType<typeof resolveDesignParams>
  sources: string[]
  summary: string
  content: string
}

function buildMDX({ title, date, design, sources, summary, content }: BuildMDXParams): string {
  const safeTitle = title.replace(/"/g, '\\"')
  const safeSummary = summary.replace(/"/g, '\\"')

  return `---
title: "${safeTitle}"
date: "${date}"
slug: "${date}"
theme: "${design.theme}"
seed: ${design.seed}
hue: ${Math.round(design.hue)}
fontPair: 0
speedMultiplier: ${design.speedMultiplier.toFixed(1)}
summary: "${safeSummary}"
sources:
${sources.map((s) => `  - ${s}`).join('\n')}
---

${content}
`
}
