import path from 'node:path'
import { defineConfig } from 'vite'
import solidPlugin from 'vite-plugin-solid'
import { vanillaExtractPlugin } from '@vanilla-extract/vite-plugin'
import { createHtmlPlugin } from 'vite-plugin-html'
import manifest from './package.json'

// Optional/guarded plugins
let ViteWebfontDownload: any = null
let TsconfigPaths: any = null
let injectScriptsToHtmlDuringBuild: any = () => ({ name: 'noop' })
let mangleClassNames: any = () => ({ name: 'noop' })
let serviceWorker: any = () => ({ name: 'noop' })

try {
  const mod = await import('vite-plugin-webfont-dl')
  ViteWebfontDownload = mod.ViteWebfontDownload || mod.default
} catch {}

try {
  const mod = await import('vite-tsconfig-paths')
  TsconfigPaths = mod.default || mod
} catch {}

try {
  injectScriptsToHtmlDuringBuild = (await import('./lib/vite-inject-scripts-to-html')).injectScriptsToHtmlDuringBuild
} catch {}
try {
  mangleClassNames = (await import('./lib/vite-mangle-classnames')).mangleClassNames
} catch {}
try {
  serviceWorker = (await import('./lib/vite-service-worker')).serviceWorker
} catch {}

const isProd = process.env.NODE_ENV === 'production'
const enableSw = isProd

// Fallback transform: rewrite "~/" to absolute path if alias somehow misses
const tildeRewrite = () => ({
  name: 'tilde-rewrite',
  enforce: 'pre' as const,
  resolveId(source: string) {
    if (source.startsWith('~/')) {
      return path.resolve(__dirname, 'src', source.slice(2))
    }
    return null
  },
})

export default defineConfig({
  plugins: [
    solidPlugin(),
    vanillaExtractPlugin(),
    createHtmlPlugin({ inject: { data: { version: manifest.version || '1.0.0' } } }),
    tildeRewrite(),
    ...(TsconfigPaths ? [TsconfigPaths()] : []),
    ...(ViteWebfontDownload ? [ViteWebfontDownload()] : []),
    ...(isProd ? [mangleClassNames(), injectScriptsToHtmlDuringBuild()] : []),
    ...(enableSw ? [serviceWorker()] : []),
  ] as any,
  
  resolve: {
    alias: [
      { find: /^~\//, replacement: path.resolve(__dirname, 'src') + '/' },
      { find: '~', replacement: path.resolve(__dirname, 'src') },
    ],
  },
},
  build: {
    target: 'esnext',
    outDir: 'dist',
  },
})