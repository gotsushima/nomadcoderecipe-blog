import type { Metadata } from 'next'
import {
  Space_Grotesk,
  Fraunces,
  IBM_Plex_Mono,
  Syne,
  Playfair_Display,
  Lora,
  Inter,
  Instrument_Serif,
} from 'next/font/google'
import './globals.css'
import { LenisProvider } from './providers/lenis'

// ── Google Fonts — next/font で最適化 (layout shift なし) ──
const spaceGrotesk = Space_Grotesk({ subsets: ['latin'], variable: '--font-space-grotesk', display: 'swap' })
const fraunces = Fraunces({ subsets: ['latin'], variable: '--font-fraunces', display: 'swap' })
const ibmPlexMono = IBM_Plex_Mono({ subsets: ['latin'], weight: ['400', '500'], variable: '--font-ibm-plex-mono', display: 'swap' })
const syne = Syne({ subsets: ['latin'], variable: '--font-syne', display: 'swap' })
const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-playfair', display: 'swap' })
const lora = Lora({ subsets: ['latin'], variable: '--font-lora', display: 'swap' })
const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' })
const instrumentSerif = Instrument_Serif({
  subsets: ['latin'],
  weight: '400',
  style: ['normal', 'italic'],
  variable: '--font-instrument-serif',
  display: 'swap',
})

const fontVariables = [
  spaceGrotesk.variable,
  fraunces.variable,
  ibmPlexMono.variable,
  syne.variable,
  playfair.variable,
  lora.variable,
  inter.variable,
  instrumentSerif.variable,
].join(' ')

export const metadata: Metadata = {
  title: {
    default: 'nomadcoderecipe — blog',
    template: '%s | nomadcoderecipe',
  },
  description: 'AIとの対話から生まれる思考の記録。毎日更新。',
  metadataBase: new URL('https://nomadcoderecipe.com'),
  openGraph: {
    type: 'website',
    locale: 'ja_JP',
    url: 'https://nomadcoderecipe.com/blog',
    siteName: 'nomadcoderecipe',
  },
  twitter: {
    card: 'summary_large_image',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja" className={`${fontVariables} dark h-full`}>
      <body className="flex min-h-full flex-col bg-background text-foreground">
        <LenisProvider>{children}</LenisProvider>
      </body>
    </html>
  )
}
