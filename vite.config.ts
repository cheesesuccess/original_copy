import path from 'node:path'
import { defineConfig } from 'vite'
import solidPlugin from 'vite-plugin-solid'
import { vanillaExtractPlugin } from '@vanilla-extract/vite-plugin'
import { createHtmlPlugin } from 'vite-plugin-html'
import { ViteWebfontDownload } from 'vite-plugin-webfont-dl'
import manifest from './package.json'

let injectScriptsToHtmlDuringBuild: any = () => ({ name: 'noop' })
let mangleClassNames: any = () => ({ name: 'noop' })
let serviceWorker: any = () => ({ name: 'noop' })
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

export default defineConfig({
  plugins: [
    solidPlugin(),
    vanillaExtractPlugin(),
    ViteWebfontDownload(),
    createHtmlPlugin({
      inject: { data: { version: manifest.version || '1.0.0' } },
    }),
    ...(isProd ? [mangleClassNames(), injectScriptsToHtmlDuringBuild()] : []),
    ...(enableSw ? [serviceWorker()] : []),
  ] as any,
  resolve: {
    alias: { '~': path.resolve(__dirname, 'src') },
  },
  build: {
    target: 'esnext',
    outDir: 'dist',
  },
})
