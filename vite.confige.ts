import fs from 'node:fs'
import path from 'node:path'
import { createRequire } from 'node:module'
import { defineConfig } from 'vite'
import solidPlugin from 'vite-plugin-solid'
import { vanillaExtractPlugin } from '@vanilla-extract/vite-plugin'
import { createHtmlPlugin } from 'vite-plugin-html'
import manifest from './package.json'

const require = createRequire(import.meta.url)

// Optional/guarded plugins via require (no top-level await)
let ViteWebfontDownload: any = null
let TsconfigPaths: any = null
try {
  const mod = require('vite-plugin-webfont-dl')
  ViteWebfontDownload = mod?.ViteWebfontDownload || mod?.default || null
} catch {}

try {
  const mod = require('vite-tsconfig-paths')
  TsconfigPaths = mod?.default || mod || null
} catch {}

const isProd = process.env.NODE_ENV === 'production'
const enableSw = isProd

function resolveWithExtensions(base: string) {
  const exts = ['', '.ts', '.tsx', '.js', '.jsx', '.mjs', '/index.ts', '/index.tsx', '/index.js', '/index.jsx']
  for (const ext of exts) {
    const p = base + ext
    if (fs.existsSync(p)) return p
  }
  return null
}

// Strong resolver for "~/" imports that also tries extensions and index files
const tildeResolver = () => ({
  name: 'tilde-resolver',
  enforce: 'pre' as const,
  resolveId(source: string) {
    if (source.startsWith('~/')) {
      const base = path.resolve(__dirname, 'src', source.slice(2))
      const found = resolveWithExtensions(base)
      if (found) return found
      return path.resolve(__dirname, 'src', source.slice(2))
    }
    return null
  },
})

export default defineConfig({
  // Explicit root, just in case
  root: __dirname,
  plugins: [
    vanillaExtractPlugin(),
    solidPlugin(),
    createHtmlPlugin({ inject: { data: { version: manifest.version || '1.0.0' } } }),
    tildeResolver(),
    ...(TsconfigPaths ? [TsconfigPaths()] : []),
    ...(ViteWebfontDownload ? [ViteWebfontDownload()] : []),
    // Avoid SW/mangler (they were optional earlier)
  ] as any,
  resolve: {
    alias: {
      '~/': path.resolve(__dirname, 'src') + '/',
      '~': path.resolve(__dirname, 'src'),
    },
  },
  
  optimizeDeps: {
    include: [],
    exclude: ['@vanilla-extract/css', '@vanilla-extract/dynamic']
  },
build: {
    target: 'esnext',
    outDir: 'dist',
  },
})
