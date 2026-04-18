/**
 * Supabase サーバーサイドクライアント
 * service_role key を使用 — サーバーサイド (scripts / API routes) のみで使用すること
 * クライアントコンポーネント・フロントエンドには絶対に渡さない
 */

// supabase-js を直接使わず fetch ベースで最小実装
// → 依存を減らし、Edge Runtime でも動作させるため

const SUPABASE_URL = process.env['SUPABASE_URL']
const SUPABASE_KEY = process.env['SUPABASE_SERVICE_ROLE_KEY']

function assertEnv(): { url: string; key: string } {
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    throw new Error('SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY が未設定です')
  }
  return { url: SUPABASE_URL, key: SUPABASE_KEY }
}

interface SupabaseRequestOptions {
  method?: 'GET' | 'POST' | 'PATCH'
  table: string
  query?: string
  body?: unknown
}

async function supabaseRequest<T>({ method = 'GET', table, query = '', body }: SupabaseRequestOptions): Promise<T[]> {
  const { url, key } = assertEnv()
  const endpoint = `${url}/rest/v1/${table}${query ? `?${query}` : ''}`

  const res = await fetch(endpoint, {
    method,
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
      Prefer: method === 'POST' ? 'return=representation' : 'return=minimal',
    },
    body: body ? JSON.stringify(body) : undefined,
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Supabase ${method} ${table} failed: ${err}`)
  }

  if (method === 'PATCH') return []
  return res.json() as Promise<T[]>
}

export interface Conversation {
  id: string
  date: string
  source: 'claude' | 'chatgpt'
  title: string | null
  raw_text: string
  processed: boolean
  created_at: string
}

/** 前日の未処理会話を取得する */
export async function fetchUnprocessedConversations(date: string): Promise<Conversation[]> {
  return supabaseRequest<Conversation>({
    table: 'conversations',
    query: `date=eq.${date}&processed=eq.false&order=created_at.asc`,
  })
}

/** 会話を登録する */
export async function insertConversation(
  data: Omit<Conversation, 'id' | 'processed' | 'created_at'>,
): Promise<Conversation> {
  const rows = await supabaseRequest<Conversation>({
    method: 'POST',
    table: 'conversations',
    body: data,
  })
  const row = rows[0]
  if (!row) throw new Error('Insert failed: no row returned')
  return row
}

/** 会話を処理済みにマークする */
export async function markConversationsProcessed(ids: string[]): Promise<void> {
  // UUID形式のみ許可 (インジェクション対策)
  const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  const safeIds = ids.filter((id) => UUID_RE.test(id))
  if (safeIds.length === 0) return

  await supabaseRequest({
    method: 'PATCH',
    table: 'conversations',
    query: `id=in.(${safeIds.join(',')})`,
    body: { processed: true },
  })
}
