import path from 'node:path'
import { defineConfig } from 'vite'
import solidPlugin from 'vite-plugin-solid'
import { vanillaExtractPlugin } from '@vanilla-extract/vite-plugin'
import { createHtmlPlugin } from 'vite-plugin-html'
import manifest from './package.json'


const fixSolidVirtualContainer = () => ({
  name: 'fix-solid-virtual-container-const',
  enforce: 'pre',
  apply: 'serve',
  transform(code, id) {
    if (id.includes('@minht11/solid-virtual-container/dist/esm/index.js')) {
      return code.replace(/const\s+setContainerRefEl/g, 'let setContainerRefEl')
    }
  }
})

export default defineConfig({
  plugins: [
    fixSolidVirtualContainer(),
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
