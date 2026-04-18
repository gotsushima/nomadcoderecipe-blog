import type { ThemeName } from '@/lib/design'
import { OrbitalTheme } from './Orbital'
import { WaveTheme } from './Wave'
import { NoiseTheme } from './Noise'
import { GeometricTheme } from './Geometric'
import { FlowTheme } from './Flow'
import { GridTheme } from './Grid'
import { VoidTheme } from './Void'
import { GlyphTheme } from './Glyph'

interface ThemeHeaderProps {
  theme: ThemeName
  seed: number
  speedMultiplier: number
  title: string
}

export function ThemeHeader({ theme, seed, speedMultiplier, title }: ThemeHeaderProps) {
  const props = { seed, speedMultiplier }

  switch (theme) {
    case 'orbital':   return <OrbitalTheme {...props} />
    case 'wave':      return <WaveTheme {...props} />
    case 'noise':     return <NoiseTheme {...props} />
    case 'geometric': return <GeometricTheme {...props} />
    case 'flow':      return <FlowTheme {...props} />
    case 'grid':      return <GridTheme {...props} />
    case 'void':      return <VoidTheme {...props} />
    case 'glyph':     return <GlyphTheme {...props} title={title} />
  }
}
