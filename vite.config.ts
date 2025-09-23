import path from 'node:path'
import { defineConfig } from 'vite'
import solidPlugin from 'vite-plugin-solid'
import { vanillaExtractPlugin } from '@vanilla-extract/vite-plugin'
import { createHtmlPlugin } from 'vite-plugin-html'
import manifest from './package.json'
import { mangleClassNames } from './lib/vite-mangle-classnames'
import { injectScriptsToHtmlDuringBuild } from './lib/vite-inject-scripts-to-html'
import { serviceWorker } from './lib/vite-service-worker'

export default defineConfig({
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
      output: {
        comments: false,
      },
      module: true,
      compress: {
        passes: 3,
        unsafe_math: true,
        unsafe_methods: true,
        unsafe_arrows: true,
      },
      mangle: {
        properties: {
          regex: /^_/,
        },
      },
    },
    rollupOptions: {
      output: {
        // Cache busting filenames with hashes
        entryFileNames: 'assets/[name].[hash].js',
        chunkFileNames: 'assets/[name].[hash].js',
        assetFileNames: 'assets/[name].[hash].[ext]',
        // Disable vendor chunking
        manualChunks: undefined,
        preferConst: true,
      },
    },
  },
  plugins: [
    createHtmlPlugin({ minify: true }),
    injectScriptsToHtmlDuringBuild({
      input: ['./src/disable-app-if-not-supported.ts'],
    }),
    mangleClassNames(),
    vanillaExtractPlugin(),
    solidPlugin({ hot: false }),
    serviceWorker({
      manifest: {
        short_name: 'Osho',
        name: 'Osho Digital Library',
        start_url: './',
        scope: './',
        theme_color: '#1a1a1a',
        background_color: '#1a1a1a',
        display: 'standalone',
        orientation: 'portrait',
        description: manifest.description,
        icons: [
          {
            src: '/icons/icon_responsive.svg',
            type: 'image/svg+xml',
            sizes: 'any',
            purpose: 'any',
          },
          {
            src: '/icons/icon_maskable.svg',
            type: 'image/svg+xml',
            sizes: 'any',
            purpose: 'maskable',
          },
        ],
        screenshots: [
          { sizes: '1079x1919', src: '/screenshots/small_1.webp', type: 'image/webp' },
          { sizes: '1079x1919', src: '/screenshots/small_2.webp', type: 'image/webp' },
          { sizes: '1079x1919', src: '/screenshots/small_3.webp', type: 'image/webp' },
          { sizes: '1276x960', src: '/screenshots/medium_1.webp', type: 'image/webp' },
          { sizes: '1276x960', src: '/screenshots/medium_2.webp', type: 'image/webp' },
          { sizes: '1276x960', src: '/screenshots/medium_3.webp', type: 'image/webp' },
        ],
      },
    }),
    // Custom plugin to replace index.html's script src with hashed filename
    {
      name: 'html-transform',
      apply: 'build',
      enforce: 'post',
      async transformIndexHtml(html, { bundle }) {
        // Find the main entry chunk
        const mainChunk = Object.values(bundle).find(
          (chunk) => chunk.type === 'chunk' && chunk.isEntry
        );
        if (mainChunk) {
          // Replace the script tag with the hashed filename
          html = html.replace(
            /<script\s+type='module'\s+src='\.\/src\/index\.ts'><\/script>/,
            `<script type='module' src='/assets/${mainChunk.file}'></script>`
          );
        }
        return html;
      },
    },
  ],
})
