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

  server: {
    host: true,
    port: 3000,
    // Allow Render domains and the dynamic external hostname
    allowedHosts: [
      process.env.RENDER_EXTERNAL_HOSTNAME || '',
      '.onrender.com',
      '.render.com',
      'localhost',
      '127.0.0.1'
    ].filter(Boolean),
    hmr: {
      protocol: 'wss',
      host: process.env.RENDER_EXTERNAL_HOSTNAME || undefined,
      clientPort: 443
    }
  },

})
