/**
 * Design System — Deterministic seed-based design generation
 * DESIGN.md のルールに従い、日付スラッグから全デザインパラメータを生成する
 */

export type ThemeName =
  | 'orbital'
  | 'wave'
  | 'noise'
  | 'geometric'
  | 'flow'
  | 'grid'
  | 'void'
  | 'glyph'

export interface Palette {
  bg: string
  surface: string
  primary: string
  secondary: string
  accent: string
  text: string
  muted: string
}

export interface FontPair {
  heading: string
  body: string
  headingClass: string
  bodyClass: string
}

export interface DesignParams {
  theme: ThemeName
  seed: number
  hue: number
  palette: Palette
  fontPair: FontPair
  speedMultiplier: number
}

const THEMES: ThemeName[] = [
  'orbital',
  'wave',
  'noise',
  'geometric',
  'flow',
  'grid',
  'void',
  'glyph',
]

// 各テーマの推奨 hue 帯の中央値 (DESIGN.md 準拠)
const THEME_HUE_BIAS: Record<ThemeName, number> = {
  orbital: 270,
  wave: 190,
  noise: 30,
  geometric: -1, // seed任意
  flow: 220,
  grid: 120,
  void: 230,
  glyph: -1, // コンテンツ次第
}

export const FONT_PAIRS: FontPair[] = [
  { heading: 'Space Grotesk', body: 'Fraunces', headingClass: 'font-space-grotesk', bodyClass: 'font-fraunces' },
  { heading: 'IBM Plex Mono', body: 'Newsreader', headingClass: 'font-ibm-plex-mono', bodyClass: 'font-newsreader' },
  { heading: 'Syne', body: 'DM Sans', headingClass: 'font-syne', bodyClass: 'font-dm-sans' },
  { heading: 'Playfair Display', body: 'Inter', headingClass: 'font-playfair', bodyClass: 'font-inter' },
  { heading: 'Bebas Neue', body: 'Source Serif 4', headingClass: 'font-bebas', bodyClass: 'font-source-serif' },
  { heading: 'Cabinet Grotesk', body: 'Lora', headingClass: 'font-cabinet', bodyClass: 'font-lora' },
  { heading: 'Clash Display', body: 'Satoshi', headingClass: 'font-clash', bodyClass: 'font-satoshi' },
  { heading: 'Instrument Serif', body: 'Geist', headingClass: 'font-instrument', bodyClass: 'font-geist' },
]

/**
 * 32bit 整数ハッシュ (djb2 アルゴリズム)
 * 同じ文字列からは常に同じ値を返す
 */
export function hashString(str: string): number {
  let hash = 5381
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = (hash * 33) ^ char
  }
  return Math.abs(hash >>> 0)
}

/**
 * OKLCH パレットを生成する
 * 黄金角 (137.508°) を利用して知覚的に均一に色相を分散
 */
export function generatePalette(seed: number, hue: number): Palette {
  const hueSecondary = (hue + 60) % 360
  const hueAccent = (hue + 180) % 360

  return {
    bg: `oklch(10% 0.03 ${hue})`,
    surface: `oklch(16% 0.04 ${hue})`,
    primary: `oklch(68% 0.20 ${hue})`,
    secondary: `oklch(58% 0.15 ${hueSecondary})`,
    accent: `oklch(78% 0.25 ${hueAccent})`,
    text: `oklch(92% 0.02 ${hue})`,
    muted: `oklch(55% 0.05 ${hue})`,
  }
}

/**
 * スラッグ (YYYY-MM-DD) からデザインパラメータを決定論的に生成する
 * themeName が渡された場合はそちらを優先 (AI選択を尊重)
 */
export function resolveDesignParams(slug: string, themeName?: ThemeName): DesignParams {
  const seed = hashString(slug)

  const theme = themeName ?? THEMES[seed % THEMES.length] ?? 'orbital'
  const hueBias = THEME_HUE_BIAS[theme]
  const baseHue = (seed * 137.508) % 360
  // テーマの推奨帯に最大±30度補正
  const hue =
    hueBias === -1
      ? baseHue
      : (() => {
          const diff = ((hueBias - baseHue + 540) % 360) - 180
          const clampedDiff = Math.max(-30, Math.min(30, diff))
          return (baseHue + clampedDiff + 360) % 360
        })()

  const palette = generatePalette(seed, hue)
  const fontPairIndex = (seed >> 8) % FONT_PAIRS.length
  const fontPair = FONT_PAIRS[fontPairIndex] ?? FONT_PAIRS[0]!
  const speedMultiplier = 0.6 + (seed % 5) * 0.2

  return { theme, seed, hue, palette, fontPair, speedMultiplier }
}

/** パレットを CSS Custom Properties の文字列に変換 */
export function paletteToCssVars(palette: Palette): Record<string, string> {
  return {
    '--color-bg': palette.bg,
    '--color-surface': palette.surface,
    '--color-primary': palette.primary,
    '--color-secondary': palette.secondary,
    '--color-accent': palette.accent,
    '--color-text': palette.text,
    '--color-muted': palette.muted,
  }
}
