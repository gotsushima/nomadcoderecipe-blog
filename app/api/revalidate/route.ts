import { revalidatePath } from 'next/cache'
import { NextRequest, NextResponse } from 'next/server'

/**
 * POST /api/revalidate
 * Supabase Webhook または generate-post.ts から呼ばれる
 * HMAC-SHA256 署名で認証する
 */
export async function POST(req: NextRequest) {
  const secret = process.env['REVALIDATE_SECRET']
  if (!secret) {
    return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 })
  }

  // Authorization: Bearer <secret> による認証
  const authHeader = req.headers.get('authorization')
  const token = authHeader?.replace('Bearer ', '')

  // タイミング攻撃対策: 比較には定数時間の関数を使う
  if (!token || !timingSafeEqual(token, secret)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // body から slug を取得 (省略時は全体を revalidate)
  let slug: string | undefined
  try {
    const body = (await req.json()) as { slug?: string }
    slug = body.slug
  } catch {
    // body なしでも許可
  }

  if (slug) {
    revalidatePath(`/${slug}`)
    revalidatePath('/')
  } else {
    revalidatePath('/', 'layout')
  }

  return NextResponse.json({ revalidated: true, slug: slug ?? 'all', timestamp: Date.now() })
}

/** 文字列を定数時間で比較する (タイミング攻撃対策) */
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let result = 0
  for (let i = 0; i < a.length; i++) {
    result |= (a.charCodeAt(i) ?? 0) ^ (b.charCodeAt(i) ?? 0)
  }
  return result === 0
}
