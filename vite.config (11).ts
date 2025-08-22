import { defineConfig } from 'vite'
import solidPlugin from 'vite-plugin-solid'
import { vanillaExtractPlugin } from '@vanilla-extract/vite-plugin'
import { createHtmlPlugin } from 'vite-plugin-html'
import manifest from './package.json' assert { type: 'json' }

// Hot-patch buggy library at serve time
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
    createHtmlPlugin({ inject: { data: { version: (manifest.version || '1.0.0') } } }),
  ],
  optimizeDeps: { disabled: true },
  build: { target: 'esnext', outDir: 'dist' },
  server: {
    host: true,
    allowedHosts: [
      process.env.RENDER_EXTERNAL_HOSTNAME || '',
      '.onrender.com', '.render.com',
      'localhost', '127.0.0.1'
    ].filter(Boolean),
    hmr: false
  }
})
