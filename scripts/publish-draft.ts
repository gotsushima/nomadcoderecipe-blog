/**
 * publish-draft.ts
 * 下書き記事の draft: true を削除して公開状態にする
 *
 * 実行方法:
 *   npm run publish 2026-04-18-digest
 *   npm run publish              ← 最新の下書きを自動選択
 */

import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { execSync } from 'child_process'

const POSTS_DIR = path.join(process.cwd(), 'posts')

function findLatestDraft(): string | null {
  if (!fs.existsSync(POSTS_DIR)) return null
  const drafts = fs
    .readdirSync(POSTS_DIR)
    .filter((f) => f.endsWith('.mdx'))
    .map((f) => {
      const slug = f.replace(/\.mdx$/, '')
      const raw = fs.readFileSync(path.join(POSTS_DIR, f), 'utf-8')
      const { data } = matter(raw)
      return { slug, draft: data.draft === true }
    })
    .filter((p) => p.draft)
    .sort((a, b) => b.slug.localeCompare(a.slug))
  return drafts[0]?.slug ?? null
}

async function main() {
  const targetSlug = process.argv[2] ?? findLatestDraft()

  if (!targetSlug) {
    console.log('[publish] 下書きが見つかりません。')
    return
  }

  const filePath = path.join(POSTS_DIR, `${targetSlug}.mdx`)
  if (!fs.existsSync(filePath)) {
    console.error(`[publish] ファイルが見つかりません: posts/${targetSlug}.mdx`)
    process.exit(1)
  }

  const raw = fs.readFileSync(filePath, 'utf-8')
  const { data, content } = matter(raw)

  if (!data.draft) {
    console.log(`[publish] posts/${targetSlug}.mdx はすでに公開済みです。`)
    return
  }

  // draft: true を削除して上書き
  delete data.draft
  const newRaw = matter.stringify(content, data)
  fs.writeFileSync(filePath, newRaw, 'utf-8')
  console.log(`[publish] draft を解除しました: posts/${targetSlug}.mdx`)

  // git commit + push
  try {
    execSync(`git add posts/${targetSlug}.mdx`, { cwd: process.cwd(), stdio: 'pipe' })
    execSync(`git commit -m "publish: ${targetSlug}"`, { cwd: process.cwd(), stdio: 'pipe' })
    execSync('git push origin main', { cwd: process.cwd(), stdio: 'pipe' })
    console.log('[publish] git push 完了 → Vercel が自動デプロイします')
  } catch (e) {
    console.warn('[publish] git push 失敗 (ファイルは更新済み):', e)
  }
}

main().catch((e) => {
  console.error('[publish] エラー:', e)
  process.exit(1)
})
