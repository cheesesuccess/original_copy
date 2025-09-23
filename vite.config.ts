import path from 'node:path';
import { defineConfig } from 'vite';
import solidPlugin from 'vite-plugin-solid';
import { vanillaExtractPlugin } from '@vanilla-extract/vite-plugin';
import { createHtmlPlugin } from 'vite-plugin-html';

export default defineConfig({
  plugins: [
    solidPlugin(),
    vanillaExtractPlugin(),
    createHtmlPlugin({
      inject: {
        data: {
          title: 'My App',
        },
      },
    }),
  ],

  resolve: {
    alias: {
      '~': path.resolve(__dirname, 'src'),
    },
  },

  build: {
    //  Ensures all JS/CSS files have hashes in filenames for cache busting
    rollupOptions: {
      output: {
        entryFileNames: 'assets/[name].[hash].js',
        chunkFileNames: 'assets/[name].[hash].js',
        assetFileNames: 'assets/[name].[hash].[ext]',
      },
    },
  },

  server: {
    port: 3000,
  },
});

