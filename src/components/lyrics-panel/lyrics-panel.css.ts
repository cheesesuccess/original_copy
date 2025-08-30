import { style } from '@vanilla-extract/css'
import { sprinkles } from '~/styles/styles.css'
import { vars } from '~/styles/vars.css'

export const container = style([
  sprinkles({
    paddingY: '16px',
  }),
  style({
    marginTop: '8px',
    borderTop: `1px solid ${vars.colors.outlineVariant}`,
  }),
])

export const title = sprinkles({
  typography: 'headlineSmall',
  color: 'secondary',
})

export const text = style([
  sprinkles({
    typography: 'bodyLarge',
    color: 'onSurfaceVariant',
  }),
  style({
    whiteSpace: 'pre-wrap',
  }),
])
