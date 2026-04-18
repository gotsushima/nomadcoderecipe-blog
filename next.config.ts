import type { NextConfig } from 'next'

const CSP = [
  "default-src 'self'",
  // Next.js のインライン script + Turbopack HMR に必要
  "script-src 'self' 'unsafe-inline'",
  // CSS-in-JS / CSS Variables のインラインスタイルに必要
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  // Google Fonts のフォントファイル
  "font-src 'self' https://fonts.gstatic.com",
  // Canvas / WebGL (ジェネレーティブアート)
  "img-src 'self' data: blob:",
  // Supabase への接続 (サーバーサイドのみ。フロント→Supabase 直接通信は行わない)
  "connect-src 'self'",
  // frame / object は不要
  "frame-ancestors 'none'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join('; ')

const securityHeaders = [
  { key: 'Content-Security-Policy', value: CSP },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
]

const nextConfig: NextConfig = {
  // basePath は設定しない
  // → このアプリ自体が blog 専用。ルート / で動作する
  // → nomadcoderecipe.com/blog へのルーティングは Cloudflare Workers で担当

  // 画像は外部ソース不使用のため最小設定
  images: { unoptimized: false },

  // セキュリティヘッダー
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
    ]
  },

  // MDX ファイルを処理
  pageExtensions: ['ts', 'tsx', 'mdx'],
}

export default nextConfig
