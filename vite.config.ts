import path from 'node:path'
import { defineConfig } from 'vite'
import solidPlugin from 'vite-plugin-solid'
import { vanillaExtractPlugin } from '@vanilla-extract/vite-plugin'
import { createHtmlPlugin } from 'vite-plugin-html'
import { mangleClassNames } from './lib/vite-mangle-classnames'
import { injectScriptsToHtmlDuringBuild } from './lib/vite-inject-scripts-to-html'

// NOTE: If this is a user/organization site (https://<user>.github.io/), keep base: '/'.
// If it's a project site (https://<user>.github.io/<repo>/), set base: '/<repo>/'.
export default defineConfig({
  base: '/',

  resolve: {
    alias: {
      '~': path.resolve(__dirname, './src'),
      // Replace any usage of the virtual PWA register with a no-op stub.
      'virtual:pwa-register': path.resolve(
        __dirname,
        './src/sw/virtual-pwa-register-stub.ts',
      ),
    },
  },

  build: {
    target: 'esnext',
    cssCodeSplit: false,
    sourcemap: true,        // helpful if anything breaks in production
    minify: 'esbuild',      // safer & faster than terser for most apps
    rollupOptions: {
      output: {
        manualChunks: undefined, // single bundle (matches your previous intent)
        preferConst: true,
      },
    },
  },

  plugins: [
    createHtmlPlugin({ minify: true }),

    // Inject early scripts: keep the unsupported-browser guard,
    // and also a tiny runtime that unregisters existing SWs
    // and blocks future registrations.
    injectScriptsToHtmlDuringBuild({
      input: [
        './src/disable-app-if-not-supported.ts',
        './src/quick-no-sw.ts', // make sure this file exists
      ],
    }),

    mangleClassNames(),
    vanillaExtractPlugin(),
    solidPlugin({ hot: false }),

    // (Intentionally no serviceWorker(...) plugin here)
  ],
})
