import path from 'node:path'
import { defineConfig } from 'vite'
import solidPlugin from 'vite-plugin-solid'
import { vanillaExtractPlugin } from '@vanilla-extract/vite-plugin'
import { createHtmlPlugin } from 'vite-plugin-html'
// import { ViteWebfontDownload } from 'vite-plugin-webfont-dl'
import manifest from './package.json'
import { mangleClassNames } from './lib/vite-mangle-classnames'
import { injectScriptsToHtmlDuringBuild } from './lib/vite-inject-scripts-to-html'
//  Removed: import { serviceWorker } from './lib/vite-service-worker'

const createMScreenshot = (name: string, sizes: string) => ({
  sizes,
  src: `/screenshots/${name}.webp`,
  type: 'image/webp',
})

export default defineConfig({
  // Leave this exactly as you’re currently using (root or /repo/).
  base: '/',
  resolve: {
    alias: {
      '~': path.resolve(__dirname, './src'),
    },
  },
  build: {
    target: 'esnext',
    polyfillDynamicImport: false,
    polyfillModulePreload: false,
    cssCodeSplit: false,
    minify: 'terser',
    terserOptions: {
      output: { comments: false },
      module: true,
      compress: { passes: 3, unsafe_math: true, unsafe_methods: true, unsafe_arrows: true },
      mangle: { properties: { regex: /^_/ } },
    },
    rollupOptions: {
      output: {
        manualChunks: undefined,
        preferConst: true,
      },
    },
  },
  plugins: [
    createHtmlPlugin({ minify: true }),

    // Inject both: 1) unsupported-browser guard, 2) SW unregistration script
    injectScriptsToHtmlDuringBuild({
      input: [
        './src/disable-app-if-not-supported.ts',
        './src/sw-unregister.ts', //  added
      ],
    }),

    mangleClassNames(),
    vanillaExtractPlugin(),
    solidPlugin({ hot: false }),

    //  Removed the serviceWorker(...) plugin block entirely
  ],
})
