import { style } from '@vanilla-extract/css'
import { sprinkles } from '~/styles/styles.css'

export const page = style([
  sprinkles({}),
  {
    minHeight: '100vh',
    display: 'grid',
    placeItems: 'center',
    background: '#f3f3f5',
  },
])

export const card = style([
  {
    width: 'min(420px, 92vw)',
    background: '#ffffff',
    borderRadius: '24px',
    padding: '28px',
    boxShadow: '0 12px 40px rgba(0,0,0,0.10)',
  },
])

export const brandRow = style({
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  marginBottom: '6px',
})

export const brand = style({
  fontSize: '28px',
  fontWeight: 800,
  color: '#0a0a0a',
})

export const subtitle = style({
  color: '#2b2b2b',
  opacity: 0.7,
  marginBottom: '18px',
})

export const input = style({
  width: '100%',
  border: '1px solid rgba(0,0,0,0.08)',
  background: '#f6f6f7',
  borderRadius: '999px',
  height: '46px',
  padding: '0 16px',
  outline: 'none',
  fontSize: '14px',
  marginBottom: '12px',
})

export const button = style({
  width: '100%',
  height: '48px',
  borderRadius: '999px',
  border: 'none',
  fontWeight: 700,
  background: '#0d0f16',
  color: 'white',
  cursor: 'pointer',
  marginTop: '8px',
})

export const linkRow = style({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  fontSize: '12px',
  marginTop: '6px',
})

export const ghostLink = style({
  background: 'transparent',
  border: 'none',
  color: '#0d0f16',
  opacity: 0.8,
  cursor: 'pointer',
  padding: 0,
})

export const switchRow = style({
  textAlign: 'center',
  marginTop: '18px',
  fontSize: '12px',
})
