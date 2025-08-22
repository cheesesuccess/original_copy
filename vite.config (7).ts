import path from 'node:path'
import { defineConfig } from 'vite'
import solidPlugin from 'vite-plugin-solid'
import { vanillaExtractPlugin } from '@vanilla-extract/vite-plugin'
import { createHtmlPlugin } from 'vite-plugin-html'
import manifest from './package.json'

export default defineConfig({
  plugins: [
    vanillaExtractPlugin(),
    solidPlugin(),
    createHtmlPlugin({ inject: { data: { version: manifest.version || '1.0.0' } } }),
  ],
  resolve: {
    alias: {
      '~/': path.resolve(__dirname, 'src') + '/',
      '~': path.resolve(__dirname, 'src'),
    },
  },
  optimizeDeps: {
    exclude: ['@vanilla-extract/css', '@vanilla-extract/dynamic'],
  },
  build: { target: 'esnext', outDir: 'dist' },
})
